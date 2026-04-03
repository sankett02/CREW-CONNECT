import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { logActivity } from './activity';

// GET /api/projects/:projectId/messages
export const getMessages = async (req: AuthRequest, res: Response) => {
    try {
        const { projectId } = req.params;
        const { teamOnly } = req.query;

        const where: any = { projectId };
        if (teamOnly === 'true') {
            where.isTeamOnly = true;
        } else {
            where.isTeamOnly = false;
        }

        const messages = await prisma.message.findMany({
            where,
            include: {
                sender: {
                    select: { id: true, role: true, profile: { select: { displayName: true } } }
                }
            },
            orderBy: { createdAt: 'asc' },
        });
        res.json(messages);
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// POST /api/projects/:projectId/messages
export const sendMessage = async (req: AuthRequest, res: Response) => {
    try {
        const senderId = req.user?.userId;
        const { projectId } = req.params;
        const { content, isTeamOnly, attachmentUrl, attachmentName } = req.body;

        if (!senderId) return res.status(401).json({ message: 'Unauthorized' });
        if (!content?.trim() && !attachmentUrl) return res.status(400).json({ message: 'Message or attachment required' });

        const message = await prisma.message.create({
            data: { 
                projectId, 
                senderId, 
                content: content || 'Shared an attachment', 
                isTeamOnly: !!isTeamOnly,
                attachmentUrl,
                attachmentName
            },
            include: {
                sender: { select: { id: true, role: true, profile: { select: { displayName: true } } } }
            }
        });

        // Log activity only for public messages/attachments
        if (!isTeamOnly) {
            const logContent = attachmentUrl ? `shared an attachment "${attachmentName || 'file'}"` : `sent a message to the project chat.`;
            await logActivity(projectId, senderId, 'MESSAGE_SENT', logContent);
        }

        res.status(201).json(message);
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
