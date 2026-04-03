import { Router } from 'express';
import {
    getAllUsers,
    deleteUser,
    toggleVerifyUser,
    toggleFlagUser,
    toggleFlagProject,
    getAnalytics,
    getDisputes,
    createDispute,
    resolveDispute,
} from '../controllers/admin';
import { authenticate } from '../middleware/auth';

const router = Router();

// All admin routes require auth (role check is inside each controller)
router.use(authenticate);

router.get('/users', getAllUsers);
router.delete('/users/:userId', deleteUser);
router.patch('/users/:userId/verify', toggleVerifyUser);
router.patch('/users/:userId/flag', toggleFlagUser);
router.patch('/projects/:projectId/flag', toggleFlagProject);

router.get('/analytics', getAnalytics);
router.get('/disputes', getDisputes);
router.post('/disputes', createDispute);
router.patch('/disputes/:disputeId/resolve', resolveDispute);

export default router;
