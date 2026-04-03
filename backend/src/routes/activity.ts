import { Router } from 'express';
import { getProjectActivity } from '../controllers/activity';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/:projectId', authenticate, getProjectActivity);

export default router;
