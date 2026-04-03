import { Router } from 'express';
import { register, login, forgotPassword, resetPassword, googleAuth, verifyOTP, resendOTP, getMe } from '../controllers/auth';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/google', googleAuth);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.get('/me', authenticate, getMe);

export default router;
