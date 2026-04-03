import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('⚠️ STRIPE_SECRET_KEY is missing from .env. Payments will fail.');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    apiVersion: '2025-01-27-acacia' as any, // latest stable
    typescript: true,
});

export default stripe;
