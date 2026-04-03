import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

// POST /api/projects/:projectId/ratings
export const createRating = async (req: AuthRequest, res: Response) => {
    try {
        const reviewerId = req.user?.userId;
        const { projectId } = req.params;
        const { revieweeId, score, review } = req.body;

        if (!reviewerId) return res.status(401).json({ message: 'Unauthorized' });

        // Ratings are only allowed on COMPLETED projects
        const project = await prisma.project.findUnique({ where: { id: projectId } });
        if (!project) return res.status(404).json({ message: 'Project not found' });
        if (project.status !== 'COMPLETED') {
            return res.status(403).json({ message: 'Ratings are only allowed after project completion' });
        }

        // Prevent duplicate ratings
        const existingRating = await prisma.rating.findFirst({
            where: { projectId, reviewerId, revieweeId }
        });
        if (existingRating) {
            return res.status(409).json({ message: 'You have already rated this user for this project' });
        }

        const rating = await prisma.rating.create({
            data: { projectId, reviewerId, revieweeId, score, review },
        });

        // Update the reviewee's average rating on their profile
        const allRatings = await prisma.rating.findMany({ where: { revieweeId } });
        const avgRating = allRatings.reduce((sum, r) => sum + r.score, 0) / allRatings.length;
        await prisma.profile.update({
            where: { userId: revieweeId },
            data: { ratingAvg: Math.round(avgRating * 10) / 10 },
        });

        res.status(201).json(rating);
    } catch (error) {
        console.error('Create rating error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// GET /api/projects/:projectId/ratings
export const getProjectRatings = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;
        const ratings = await prisma.rating.findMany({
            where: { projectId },
            include: {
                reviewer: { select: { profile: { select: { displayName: true } } } },
                reviewee: { select: { profile: { select: { displayName: true } } } },
            }
        });
        res.json(ratings);
    } catch (error) {
        console.error('Get ratings error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
