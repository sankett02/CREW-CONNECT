import { Response } from 'express';
import { ProjectStatus, MilestoneStatus, TeamMember, User, Profile, Milestone } from '@prisma/client';
import prisma from '../lib/prisma';
import stripe from '../lib/stripe';
import { AuthRequest } from '../middleware/auth';
import { notifyUser } from '../utils/notifyUser';
import { logActivity } from './activity';

// GET /api/projects/:projectId/milestones
export const getMilestones = async (req: AuthRequest, res: Response) => {
    try {
        const { projectId } = req.params;
        const milestones = await prisma.milestone.findMany({
            where: { projectId },
            orderBy: { title: 'asc' },
        });
        res.json(milestones);
    } catch (error) {
        console.error('Get milestones error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// POST /api/projects/:projectId/milestones – Brand or system creates milestones
export const createMilestone = async (req: AuthRequest, res: Response) => {
    try {
        const { projectId } = req.params;
        const { title, assignedRole } = req.body;

        const milestone = await prisma.milestone.create({
            data: { projectId, title, assignedRole },
        });
        res.status(201).json(milestone);
    } catch (error) {
        console.error('Create milestone error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// PATCH /api/projects/:projectId/milestones/:milestoneId – Update status
export const updateMilestoneStatus = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { milestoneId, projectId } = req.params;
        const { status, comments, submissionUrl, feedback } = req.body; // SUBMITTED | APPROVED | CHANGES_REQUESTED

        // Verify user is part of the project team (brand can approve, creator can submit)
        const project = await prisma.project.findUnique({ where: { id: projectId } });
        if (!project) return res.status(404).json({ message: 'Project not found' });

        const isBrand = project.brandId === userId;
        const teamMember = await prisma.teamMember.findFirst({ where: { projectId, userId } });

        if (!isBrand && !teamMember) {
            return res.status(403).json({ message: 'Not authorized to update this milestone' });
        }

        // Only brands can APPROVE / CHANGES_REQUESTED
        if ((status === 'APPROVED' || status === 'CHANGES_REQUESTED') && !isBrand) {
            return res.status(403).json({ message: 'Only brands can approve or request changes' });
        }

        // Only team members can SUBMIT
        if (status === 'SUBMITTED' && !teamMember) {
            return res.status(403).json({ message: 'Only team members can submit work' });
        }

        const milestone = await prisma.milestone.findUnique({ where: { id: milestoneId } });
        if (!milestone) return res.status(404).json({ message: 'Milestone not found' });

        // 🛡️ ROLE CHECK: If milestone is assigned to a specific role, only that role (or Creator Lead) can submit
        if (status === 'SUBMITTED' && milestone.assignedRole && teamMember) {
            const userRole = teamMember.role;
            const isLead = userRole === 'CREATOR_LEAD' || userRole === 'ADMIN';
            
            if (!isLead && userRole !== milestone.assignedRole) {
                return res.status(403).json({ 
                    message: `This milestone is assigned to the ${milestone.assignedRole} role. Your role is ${userRole}.` 
                });
            }
        }

        // Guard: Cannot submit if not funded
        if ((status === 'SUBMITTED' || status === 'TEAM_REVIEW') && !milestone.escrowFunded) {
            return res.status(400).json({ message: 'Cannot submit work for an unfunded milestone' });
        }

        // 🧙‍♂️ ORCHESTRATION LOGIC: Internal Phase vs Brand Phase
        let targetStatus = status as MilestoneStatus;
        
        if (status === 'SUBMITTED' && !isBrand) {
            // Check if there is a CREATOR_LEAD in the project other than the sender
            const team = await prisma.teamMember.findMany({ where: { projectId } });
            const hasLead = team.some(m => m.role === 'CREATOR_LEAD' && m.userId !== userId);
            
            // If sender is NOT the lead, and a lead exists -> move to TEAM_REVIEW first
            if (hasLead && teamMember?.role !== 'CREATOR_LEAD') {
                targetStatus = 'TEAM_REVIEW' as MilestoneStatus;
            }
        }

        const updated = await prisma.milestone.update({
            where: { id: milestoneId },
            data: { 
                status: targetStatus, 
                comments, 
                submissionUrl, 
                feedback,
                submittedAt: (targetStatus === 'SUBMITTED' || targetStatus === 'TEAM_REVIEW') ? new Date() : undefined
            },
        });

        // 📝 LOG ACTIVITY
        let activityType = 'MILESTONE_UPDATED';
        let activityContent = `updated milestone "${updated.title}" to ${targetStatus}.`;
        
        if (targetStatus === 'TEAM_REVIEW') {
            activityType = 'MILESTONE_INTERNAL_REVIEW';
            activityContent = `submitted "${updated.title}" for Team Lead review (Internal).`;
        } else if (targetStatus === 'SUBMITTED') {
            activityType = 'MILESTONE_SUBMITTED';
            activityContent = teamMember?.role === 'CREATOR_LEAD' 
                ? `Team Lead merged and submitted "${updated.title}" to the Brand.` 
                : `submitted work for milestone "${updated.title}".`;
        } else if (status === 'APPROVED') {
            activityType = 'MILESTONE_APPROVED';
            activityContent = `approved milestone "${updated.title}". Payouts initiated.`;
        } else if (status === 'CHANGES_REQUESTED') {
            activityType = 'MILESTONE_CHANGES_REQUESTED';
            activityContent = `requested changes for milestone "${updated.title}".`;
        }

        await logActivity(projectId, userId || null, activityType, activityContent);

        // 🟡 PROJECT STATUS LOGIC: Update project status based on milestone activity
        if (status === 'SUBMITTED') {
            await prisma.project.update({
                where: { id: projectId },
                data: { status: ProjectStatus.UNDER_REVIEW }
            });
        } else if (status === 'CHANGES_REQUESTED') {
            await prisma.project.update({
                where: { id: projectId },
                data: { status: ProjectStatus.ACTIVE }
            });
        }

        // 🟢 ESCROW LOGIC: Release funds only if funded and approved
        if (status === 'APPROVED' && isBrand && milestone.escrowFunded) {
            const teamMembers = await prisma.teamMember.findMany({
                where: { projectId },
                include: { user: { include: { profile: true } } }
            });
            const activeTeam = teamMembers.filter((m: TeamMember & { user: User & { profile: Profile | null } }) => m.role !== 'BRAND');

            const totalMilestonesCount = await prisma.milestone.count({ where: { projectId } }) || 1;
            const milestoneBudget = Number(project.budget) / totalMilestonesCount;
            const splitAmount = activeTeam.length > 0 ? milestoneBudget / activeTeam.length : milestoneBudget;

            // Create a payout release record and trigger Stripe Transfer for each active team member
            for (const member of activeTeam) {
                const platformFee = splitAmount * 0.10;
                const payoutAmount = Math.round((splitAmount - platformFee) * 100); // amount in cents for Stripe

                let stripeTransferId = null;

                // 💸 REAL PAYOUT: Trigger Stripe Transfer if beneficiary has a Connect Account
                if (member.user?.stripeAccountId) {
                    try {
                        const transfer = await stripe.transfers.create({
                            amount: payoutAmount,
                            currency: 'usd',
                            destination: member.user.stripeAccountId,
                            description: `Payout for Milestone: ${milestone.title} - Project: ${project.title}`,
                            metadata: {
                                projectId,
                                milestoneId,
                                userId: member.userId
                            }
                        });
                        stripeTransferId = transfer.id;
                        console.log(`✅ Stripe Transfer ${transfer.id} initiated for ${member.user.email}`);
                    } catch (err: unknown) {
                        console.error(`❌ Stripe Transfer failed for user ${member.userId}:`, (err as Error).message);
                        // We still record the payment record but with a pending/failed status or notes
                    }
                }

                await prisma.paymentRecord.create({
                    data: {
                        projectId,
                        amount: splitAmount - platformFee, // Amount creator actually receives
                        payerId: userId, // The brand released it
                        milestoneId,
                        payoutSplit: {
                            recipientId: member.userId,
                            recipientRole: member.role,
                            recipientName: member.user?.profile?.displayName ?? 'Team Member',
                            stripeTransferId,
                            type: 'ESCROW_RELEASE'
                        },
                        platformFee,
                        processingFee: 0, // Already charged when brand funded escrow
                        status: stripeTransferId ? 'PAID' : 'PAYOUT_RELEASED'
                    }
                });
            }

            // Notify each team member of the payout
            for (const member of activeTeam) {
                await notifyUser(member.userId, 'milestone_approved', {
                    projectTitle: project.title,
                });
            }
        }

        // If all milestones approved, mark project as COMPLETED
        if (status === 'APPROVED') {
            const allMilestones = await prisma.milestone.findMany({ where: { projectId } });
            const allApproved = allMilestones.every((m: Milestone) => m.status === 'APPROVED' || m.id === milestoneId);
            if (allApproved) {
                await prisma.project.update({ 
                    where: { id: projectId }, 
                    data: { 
                        status: ProjectStatus.COMPLETED,
                        completedAt: new Date()
                    }
                });

                // 📈 STATS UPDATE: Increment completedCount for all team members
                const team = await prisma.teamMember.findMany({ where: { projectId } });
                for (const member of team) {
                    await prisma.profile.update({
                        where: { userId: member.userId },
                        data: { completedCount: { increment: 1 } }
                    }).catch((err: unknown) => console.error(`Failed to update completedCount for ${member.userId}:`, (err as Error).message));
                }
            }
        }

        res.json(updated);
    } catch (error) {
        console.error('Update milestone status error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
