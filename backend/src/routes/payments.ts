import { Router } from 'express';
import { getGlobalPayments } from '../controllers/payments';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getGlobalPayments);

export default router;
