import { Response } from 'express';
import { ProjectStatus } from '@prisma/client';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

export const createProject = async (req: AuthRequest, res: Response) => {
    try {
        const brandId = req.user?.userId;
        if (!brandId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const { title, description, niche, budget, deadline } = req.body;

        const numBudget = Number(budget);
        const processingFee = numBudget * 0.03;
        const platformFee = numBudget * 0.10;

        const project = await prisma.project.create({
            data: {
                brandId,
                title,
                description,
                niche,
                budget: numBudget,
                totalBrandCost: numBudget + processingFee,
                creatorPayout: numBudget - platformFee,
                deadline: new Date(deadline),
                status: ProjectStatus.DRAFT,
            },
        });

        res.status(201).json(project);
    } catch (error) {
        console.error('Create project error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getProjects = async (req: AuthRequest, res: Response) => {
    try {
        const { status, niche } = req.query;
        const where: Record<string, unknown> = {};
        if (status) where.status = status;
        if (niche) where.niche = niche;

        const projects = await prisma.project.findMany({
            where,
            include: {
                brand: {
                    select: {
                        profile: {
                            select: { displayName: true }
                        }
                    }
                },
                team: true,
                milestones: true
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json(projects);
    } catch (error) {
        console.error('Get projects error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getProjectById = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const project = await prisma.project.findUnique({
            where: { id },
            include: {
                brand: {
                    select: { profile: true }
                },
                team: {
                    include: { user: { select: { email: true, role: true, profile: true } } }
                },
                applications: {
                    include: { creator: { select: { email: true, profile: true } } }
                },
                milestones: true,
            },
        });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        res.json(project);
    } catch (error) {
        console.error('Get project detail error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateProject = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const brandId = req.user?.userId;

        if (!brandId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const project = await prisma.project.findUnique({
            where: { id },
        });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (project.brandId !== brandId) {
            return res.status(403).json({ message: 'Forbidden: You do not own this project' });
        }

        const { title, description, niche, budget, deadline, openSlots } = req.body;

        const updateData: any = {};
        if (title) updateData.title = title;
        if (description) updateData.description = description;
        if (niche) updateData.niche = niche;
        if (deadline) updateData.deadline = new Date(deadline);
        if (openSlots) updateData.openSlots = openSlots; // Expecting stringified JSON or raw string

        if (budget !== undefined) {
            const numBudget = Number(budget);
            updateData.budget = numBudget;
            updateData.totalBrandCost = numBudget * 1.03;
            updateData.creatorPayout = numBudget * 0.90;
        }

        const updatedProject = await prisma.project.update({
            where: { id },
            data: updateData,
        });

        res.json(updatedProject);
    } catch (error) {
        console.error('Update project error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
