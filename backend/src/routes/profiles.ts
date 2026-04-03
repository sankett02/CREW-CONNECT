import { Router } from 'express';
import { getProfile, updateProfile, searchTalent } from '../controllers/profiles';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/search', searchTalent);
router.get('/:userId', getProfile);
router.put('/:userId', authenticate, updateProfile);

export default router;
