import { Router } from 'express';
import { generateProjectBrief } from '../controllers/ai';
import { authenticate } from '../middleware/auth'; // Assuming this exists based on common patterns

const router = Router();

// Protect this route so only authenticated users can use AI tokens
router.post('/generate-brief', authenticate, generateProjectBrief);

export default router;
