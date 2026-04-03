import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

export const addTeamMember = async (req: AuthRequest, res: Response) => {
    try {
        const leadId = req.user?.userId;
        const { projectId } = req.params;
        const { email, role } = req.body; // WRITER, EDITOR

        // Check if requester is CREATOR_LEAD
        const lead = await prisma.teamMember.findFirst({
            where: { projectId, userId: leadId, role: 'CREATOR_LEAD' }
        });

        if (!lead) {
            return res.status(403).json({ message: 'Unauthorized: Only the Lead Creator can manage the team' });
        }

        const targetUser = await prisma.user.findUnique({ where: { email } });
        if (!targetUser) {
            return res.status(404).json({ message: 'User not found with that email' });
        }

        const member = await prisma.teamMember.create({
            data: {
                projectId,
                userId: targetUser.id,
                role,
            }
        });

        res.status(201).json(member);
    } catch (error) {
        console.error('Add team member error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const removeTeamMember = async (req: AuthRequest, res: Response) => {
    try {
        const leadId = req.user?.userId;
        const { projectId, memberId } = req.params;

        const lead = await prisma.teamMember.findFirst({
            where: { projectId, userId: leadId, role: 'CREATOR_LEAD' }
        });

        if (!lead) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await prisma.teamMember.delete({
            where: { id: memberId }
        });

        res.status(204).send();
    } catch (error) {
        console.error('Remove team member error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
