import { Router } from 'express';
import { setupStripeAccount, createOnboardingLink, createCheckoutSession, handleStripeWebhook } from '../controllers/stripe';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/connect', authenticate, setupStripeAccount);
router.post('/onboarding-link', authenticate, createOnboardingLink);
router.post('/checkout-session', authenticate, createCheckoutSession);
router.post('/webhook', handleStripeWebhook); // Webhook usually doesn't need auth, sig check is enough

export default router;
