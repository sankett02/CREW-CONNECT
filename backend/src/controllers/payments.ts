import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

// GET /api/projects/:projectId/payments
export const getPayments = async (req: AuthRequest, res: Response) => {
    try {
        const { projectId } = req.params;
        const payments = await prisma.paymentRecord.findMany({
            where: { projectId },
            include: {
                payer: { select: { profile: { select: { displayName: true } } } },
                milestone: { select: { title: true } }
            },
            orderBy: { id: 'desc' }
        });
        res.json(payments);
    } catch (error) {
        console.error('Get payments error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// GET /api/payments - Global payments for the user (Brand and Creator)
export const getGlobalPayments = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        // SQLite doesn't support complex JSON path filtering as richly as PG,
        // so we'll fetch then filter, or use basic JSON searching if supported.
        // For efficiency, we find where user is payer, or fetch most and filter.
        const allPayments = await prisma.paymentRecord.findMany({
            include: {
                payer: { select: { profile: { select: { displayName: true } } } },
                milestone: { select: { title: true } },
                project: { select: { title: true } }
            },
            orderBy: { id: 'desc' }
        });

        // Manual filter since JSON fields in SQLite vary in implementation. 
        // This ensures compatibility and handles both possible structures.
        const filtered = allPayments.filter((p: unknown) => {
            const payment = p as Record<string, unknown>;
            if (payment.payerId === userId) return true;
            
            // Check direct recipientId
            const payoutSplit = payment.payoutSplit as Record<string, unknown>;
            if (payoutSplit && typeof payoutSplit === 'object') {
                if (payoutSplit.recipientId === userId) return true;
                
                // Check within splits array
                if (Array.isArray(payoutSplit.splits)) {
                    return (payoutSplit.splits as Array<{ userId: string }>).some((s) => s.userId === userId);
                }
            }
            return false;
        });

        res.json(filtered);
    } catch (error) {
        console.error('Get global payments error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// POST /api/projects/:projectId/payments – Brand marks milestone as paid
export const createPayment = async (req: AuthRequest, res: Response) => {
    try {
        const payerId = req.user?.userId;
        const { projectId } = req.params;
        const { amount, milestoneId, payoutSplit } = req.body;

        if (!payerId) return res.status(401).json({ message: 'Unauthorized' });

        // Only brands can mark payments
        const project = await prisma.project.findUnique({ where: { id: projectId } });
        if (!project) return res.status(404).json({ message: 'Project not found' });
        if (project.brandId !== payerId) return res.status(403).json({ message: 'Only the brand can record payments' });

        const numAmount = Number(amount);
        const processingFee = numAmount * 0.03;
        const platformFee = numAmount * 0.10;

        const payment = await prisma.paymentRecord.create({
            data: {
                projectId,
                amount: numAmount,
                payerId,
                milestoneId: milestoneId || null,
                payoutSplit: payoutSplit || {},
                platformFee,
                processingFee,
                status: 'PAID' // Technically held in Escrow by the platform
            } as unknown as {
                projectId: string;
                amount: number;
                payerId: string;
                milestoneId: string | null;
                payoutSplit: object;
                platformFee: number;
                processingFee: number;
                status: string;
            }
        });

        // 🟢 ESCROW LOGIC: If this payment is for a milestone, mark it as Funded and unlock it for the Creator
        if (milestoneId) {
            await prisma.milestone.update({
                where: { id: milestoneId },
                data: {
                    escrowFunded: true,
                    status: 'PENDING'
                }
            });
        }

        res.status(201).json(payment);
    } catch (error) {
        console.error('Create payment error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
