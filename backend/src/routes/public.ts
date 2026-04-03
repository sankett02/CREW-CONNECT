import express from 'express';
import prisma from '../lib/prisma';

const router = express.Router();

// GET /api/public/stats — no auth required, used by Landing page
router.get('/stats', async (_req, res) => {
    try {
        const [totalUsers, totalProjects, paidPayments] = await Promise.all([
            prisma.user.count(),
            prisma.project.count(),
            prisma.paymentRecord.count({ where: { status: 'PAID' } }),
        ]);

        res.json({
            totalUsers,
            totalProjects,
            totalPaid: paidPayments,
        });
    } catch (error) {
        console.error('Public stats error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
