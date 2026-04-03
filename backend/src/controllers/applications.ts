import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { notifyUser } from '../utils/notifyUser';

export const applyToProject = async (req: AuthRequest, res: Response) => {
    try {
        const creatorId = req.user?.userId;
        const { projectId } = req.params;
        const { message, appliedRole } = req.body;

        if (!creatorId) return res.status(401).json({ message: 'Unauthorized' });

        const application = await prisma.application.create({
            data: {
                projectId,
                creatorId,
                message,
                appliedRole: appliedRole || 'CREATOR',
                status: 'PENDING',
            },
        });

        // Fetch project info to notify the brand
        const project = await prisma.project.findUnique({ where: { id: projectId } });
        if (project) {
            await notifyUser(project.brandId, 'new_application', {
                projectTitle: project.title,
                projectId: project.id,
            });
        }

        res.status(201).json(application);
    } catch (error: unknown) {
        console.error('Apply to Project Error:', error);
        const message = error instanceof Error ? error.message : 'Failed to apply to project';
        res.status(500).json({ message });
    }
};

export const handleApplication = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { applicationId } = req.params;
        const { status } = req.body; // ACCEPTED, REJECTED

        const application = await prisma.application.findUnique({
            where: { id: applicationId },
            include: { project: true },
        });

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        const isBrand = application.project.brandId === userId;
        const isInvitedCreator = application.creatorId === userId && application.type === 'INVITATION';

        if (!isBrand && !isInvitedCreator) {
            return res.status(403).json({ message: 'Unauthorized to handle this application' });
        }

        // 🛡️ Guard: Only process PENDING applications
        if (application.status !== 'PENDING') {
            return res.status(400).json({ message: `Application is already ${application.status.toLowerCase()}` });
        }

        // Use a transaction to ensure atomicity
        const result = await prisma.$transaction(async (tx) => {
            // Re-verify status inside transaction for extreme safety
            const app = await tx.application.findUnique({
                where: { id: applicationId },
                select: { status: true }
            });

            if (!app || app.status !== 'PENDING') {
                throw new Error('Application has already been processed');
            }

            const updatedApp = await tx.application.update({
                where: { id: applicationId },
                data: { status },
            });

            if (status === 'ACCEPTED') {
                // Check if already a member to prevent duplicates
                const existingMember = await tx.teamMember.findFirst({
                    where: {
                        projectId: application.projectId,
                        userId: application.creatorId,
                    }
                });

                if (!existingMember) {
                    await tx.teamMember.create({
                        data: {
                            projectId: application.projectId,
                            userId: application.creatorId,
                            role: application.appliedRole || 'CREATOR_LEAD',
                        }
                    });
                }

                // Update project status to ACTIVE
                await tx.project.update({
                    where: { id: application.projectId },
                    data: { status: 'ACTIVE' }
                });
            }

            return updatedApp;
        });

        // Notify the creator if accepted (outside transaction for performance/reliability)
        if (status === 'ACCEPTED') {
            await notifyUser(application.creatorId, 'application_accepted', {
                projectTitle: application.project.title,
            });
        }

        res.json(result);
    } catch (error: unknown) {
        console.error('Handle Application Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const inviteToProject = async (req: AuthRequest, res: Response) => {
    try {
        const brandId = req.user?.userId;
        const { projectId } = req.params;
        const { creatorId, message, appliedRole } = req.body;

        if (!brandId) return res.status(401).json({ message: 'Unauthorized' });

        // Verify project belongs to brand
        const project = await prisma.project.findUnique({
            where: { id: projectId }
        });

        if (!project || project.brandId !== brandId) {
            return res.status(403).json({ message: 'Unauthorized: Project does not belong to you' });
        }

        // Check if invitation/application already exists
        const existing = await prisma.application.findFirst({
            where: { projectId, creatorId }
        });

        if (existing) {
            return res.status(400).json({ message: 'This creator already has a pending application or invitation for this project.' });
        }

        const invitation = await prisma.application.create({
            data: {
                projectId,
                creatorId,
                message,
                appliedRole: appliedRole || 'CREATOR',
                status: 'PENDING',
                type: 'INVITATION',
            },
        });

        // Fetch Brand profile for a personalized notification
        const brandProfile = await prisma.profile.findUnique({
            where: { userId: brandId }
        });

        // Notify the creator with personalized details
        await notifyUser(creatorId, 'new_invitation', {
            projectTitle: project.title,
            projectId: project.id,
            brandName: brandProfile?.displayName || 'A Brand',
        });

        res.status(201).json(invitation);
    } catch (error: unknown) {
        console.error('Invite to Project Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getMyApplications = async (req: AuthRequest, res: Response) => {
    try {
        const creatorId = req.user?.userId;
        if (!creatorId) return res.status(401).json({ message: 'Unauthorized' });

        const applications = await prisma.application.findMany({
            where: { creatorId },
            include: {
                project: {
                    include: {
                        brand: {
                            select: { profile: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(applications);
    } catch (error: unknown) {
        console.error('Get My Applications Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
