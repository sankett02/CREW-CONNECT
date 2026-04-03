import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

const requireAdmin = (req: AuthRequest, res: Response): boolean => {
    if (req.user?.role !== 'ADMIN') {
        res.status(403).json({ message: 'Admin access required' });
        return false;
    }
    return true;
};

// PATCH /api/admin/users/:userId/verify
export const toggleVerifyUser = async (req: AuthRequest, res: Response) => {
    if (!requireAdmin(req, res)) return;
    try {
        const { userId } = req.params;
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const updated = await prisma.user.update({
            where: { id: userId },
            data: { isVerified: !user.isVerified },
            select: { id: true, email: true, role: true, isVerified: true, isFlagged: true }
        });
        res.json(updated);
    } catch (error) {
        console.error('Toggle verify error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// PATCH /api/admin/users/:userId/flag
export const toggleFlagUser = async (req: AuthRequest, res: Response) => {
    if (!requireAdmin(req, res)) return;
    try {
        const { userId } = req.params;
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const updated = await prisma.user.update({
            where: { id: userId },
            data: { isFlagged: !user.isFlagged },
            select: { id: true, email: true, role: true, isVerified: true, isFlagged: true }
        });
        res.json(updated);
    } catch (error) {
        console.error('Toggle flag error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// PATCH /api/admin/projects/:projectId/flag
export const toggleFlagProject = async (req: AuthRequest, res: Response) => {
    if (!requireAdmin(req, res)) return;
    try {
        const { projectId } = req.params;
        const project = await prisma.project.findUnique({ where: { id: projectId } });
        if (!project) return res.status(404).json({ message: 'Project not found' });

        const updated = await prisma.project.update({
            where: { id: projectId },
            data: { isFlagged: !project.isFlagged },
            select: { id: true, title: true, isFlagged: true }
        });
        res.json(updated);
    } catch (error) {
        console.error('Toggle project flag error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// GET /api/admin/users
export const getAllUsers = async (req: AuthRequest, res: Response) => {
    if (!requireAdmin(req, res)) return;
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true, email: true, role: true, isVerified: true, isFlagged: true, createdAt: true,
                profile: { select: { displayName: true } }
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(users);
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// GET /api/admin/disputes
export const getDisputes = async (req: AuthRequest, res: Response) => {
    if (!requireAdmin(req, res)) return;
    try {
        const disputes = await prisma.dispute.findMany({
            include: { project: { select: { title: true } } },
            orderBy: { id: 'desc' }
        });
        res.json(disputes);
    } catch (error) {
        console.error('Get disputes error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// POST /api/admin/disputes
export const createDispute = async (req: AuthRequest, res: Response) => {
    if (!requireAdmin(req, res)) return;
    try {
        const { projectId, parties, notes } = req.body;
        const dispute = await prisma.dispute.create({
            data: { projectId, parties, notes, status: "OPEN" }
        });
        res.status(201).json(dispute);
    } catch (error) {
        console.error('Create dispute error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// PATCH /api/admin/disputes/:disputeId
export const resolveDispute = async (req: AuthRequest, res: Response) => {
    if (!requireAdmin(req, res)) return;
    try {
        const { disputeId } = req.params;
        const updated = await prisma.dispute.update({
            where: { id: disputeId },
            data: { status: 'RESOLVED' }
        });
        res.json(updated);
    } catch (error) {
        console.error('Resolve dispute error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// DELETE /api/admin/users/:userId
export const deleteUser = async (req: AuthRequest, res: Response) => {
    if (!requireAdmin(req, res)) return;
    try {
        const { userId } = req.params;
        await prisma.user.delete({ where: { id: userId } });
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// GET /api/admin/analytics
export const getAnalytics = async (req: AuthRequest, res: Response) => {
    if (!requireAdmin(req, res)) return;
    try {
        const [userCount, projectCount, payments] = await Promise.all([
            prisma.user.count(),
            prisma.project.count(),
            prisma.paymentRecord.findMany({
                where: { status: 'PAID' }
            })
        ]);

        const totalPlatformRevenue = payments.reduce((sum, p) => sum + Number((p as any).platformFee || 0), 0);
        const totalVolume = payments.reduce((sum, p) => sum + Number((p as any).amount || 0), 0);

        // Group revenue by date (last 7 days)
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        const dailyRevenue = last7Days.map(date => {
            const dayPayments = payments.filter(p => (p as any).createdAt?.toISOString().split('T')[0] === date);
            return {
                date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                revenue: dayPayments.reduce((sum, p) => sum + Number((p as any).platformFee || 0), 0)
            };
        });

        // Simple traffic / growth stats (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentUsers = await prisma.user.count({
            where: { createdAt: { gte: thirtyDaysAgo } }
        });

        res.json({
            stats: {
                totalUsers: userCount,
                totalProjects: projectCount,
                totalRevenue: totalPlatformRevenue,
                totalVolume: totalVolume,
                recentGrowth: recentUsers
            },
            dailyRevenue,
            recentPayments: payments.slice(-5)
        });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
