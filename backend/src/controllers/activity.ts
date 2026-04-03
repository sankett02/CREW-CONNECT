import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

export const getProjectActivity = async (req: AuthRequest, res: Response) => {
    try {
        const { projectId } = req.params;
        const activities = await prisma.projectActivity.findMany({
            where: { projectId },
            include: {
                user: {
                    select: { id: true, profile: { select: { displayName: true } } }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 20
        });
        res.json(activities);
    } catch (error) {
        console.error('Get activity error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const logActivity = async (projectId: string, userId: string | null, type: string, content: string) => {
    try {
        await prisma.projectActivity.create({
            data: {
                projectId,
                userId,
                type,
                content
            }
        });
    } catch (error) {
        console.error('Log activity error:', error);
    }
};
