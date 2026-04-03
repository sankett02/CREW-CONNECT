/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';
import stripe from '../lib/stripe';

// POST /api/stripe/connect – Creates a Stripe Connect Account for a Creator
export const setupStripeAccount = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        // Check if user already has a stripe account ID
        const user = await prisma.user.findUnique({ where: { id: userId } }) as unknown as { stripeAccountId: string | null };
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.stripeAccountId) {
            return res.json({ stripeAccountId: user.stripeAccountId });
        }

        // Create a new Custom Connect account
        const account = await stripe.accounts.create({
            type: 'custom',
            business_type: 'individual',
            capabilities: {
                card_payments: { requested: true } as unknown as { requested: boolean },
                transfers: { requested: true } as unknown as { requested: boolean },
            },
        });

        // Save to database
        await prisma.user.update({
            where: { id: userId },
            data: { stripeAccountId: account.id } as unknown as { stripeAccountId: string }
        });

        res.json({ stripeAccountId: account.id });
    } catch (error: unknown) {
        console.error('Setup Stripe Account Error:', error);
        res.status(500).json({ message: (error as Error).message || 'Failed to create Stripe account' });
    }
};

// POST /api/stripe/onboarding-link – Generates the hosted link for Stripe Account setup
export const createOnboardingLink = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const user = await prisma.user.findUnique({ where: { id: userId } }) as unknown as { stripeAccountId: string | null };

        if (!user?.stripeAccountId) {
            return res.status(400).json({ message: 'Stripe account not initialized' });
        }

        const accountLink = await stripe.accountLinks.create({
            account: user.stripeAccountId,
            refresh_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/profile/me`,
            return_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/profile/me?stripe=success`,
            type: 'account_onboarding',
        });

        res.json({ url: accountLink.url });
    } catch (error: unknown) {
        console.error('Create Onboarding Link Error:', error);
        res.status(500).json({ message: (error as Error).message || 'Failed to generate link' });
    }
};

// POST /api/stripe/checkout-session – Creates a Checkout session for Escrow Funding
export const createCheckoutSession = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { projectId, milestoneId } = req.body;

        const project = await prisma.project.findUnique({ where: { id: projectId } });
        const milestone = await prisma.milestone.findUnique({ where: { id: milestoneId } });

        if (!project || !milestone) {
            return res.status(404).json({ message: 'Project or Milestone not found' });
        }

        if (project.brandId !== userId) {
            return res.status(403).json({ message: 'Only the brand can fund milestones' });
        }

        // Calculate amount (using mock budget division for now)
        const totalMilestonesCount = await prisma.milestone.count({ where: { projectId } }) || 1;
        const unitAmount = Math.round((Number(project.budget) / totalMilestonesCount) * 100); // in cents
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: `Milestone: ${milestone.title}`,
                        description: `Project: ${project.title}`
                    },
                    unit_amount: unitAmount,
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/workspace/${projectId}?session_id={CHECKOUT_SESSION_ID}&fund=success`,
            cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/workspace/${projectId}?fund=cancelled`,
            metadata: {
                projectId: projectId as string,
                milestoneId: milestoneId as string,
                brandId: userId as string
            }
        } as any);

        res.json({ url: session.url });
    } catch (error: unknown) {
        console.error('Create Checkout Session Error:', error);
        res.status(500).json({ message: (error as Error).message || 'Failed to create checkout session' });
    }
};

// POST /api/stripe/webhook – Handles incoming Stripe events
export const handleStripeWebhook = async (req: AuthRequest, res: Response) => {
    let event;

    try {
        // In real world, we verify sig: const sig = req.headers['stripe-signature']; event = stripe.webhooks.constructEvent(req.rawBody, sig, secret);
        // For mock, we trust the body
        event = req.body;

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const { projectId, milestoneId, brandId } = session.metadata;

            // Update Milestone status and funding
            await prisma.milestone.update({
                where: { id: milestoneId },
                data: {
                    escrowFunded: true,
                    status: 'PENDING' // Move from DRAFT to PENDING once funded
                }
            });

            // Record Payment
            const amount = session.amount_total / 100;
            await prisma.paymentRecord.create({
                data: {
                    projectId,
                    milestoneId,
                    amount,
                    payerId: brandId,
                    payoutSplit: {}, // Will be split on release
                    platformFee: amount * 0.10,
                    processingFee: amount * 0.03,
                    status: 'PAID'
                } as unknown as {
                    projectId: string;
                    milestoneId: string;
                    amount: number;
                    payerId: string;
                    payoutSplit: object;
                    platformFee: number;
                    processingFee: number;
                    status: string;
                }
            });

            console.log(`✓ Escrow Funded for Milestone ${milestoneId}`);
        }

        res.json({ received: true });
    } catch (err: unknown) {
        console.error('Webhook Error:', (err as Error).message);
        res.status(400).send(`Webhook Error: ${(err as Error).message}`);
    }
};
