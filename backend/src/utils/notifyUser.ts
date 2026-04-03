import { sendEmail } from './sendEmail';
import prisma from '../lib/prisma';

type NotificationType =
    | 'application_accepted'
    | 'milestone_approved'
    | 'new_application'
    | 'new_invitation'
    | 'payment_sent';

const templates: Record<NotificationType, (data: Record<string, string>) => { subject: string; html: string }> = {
    application_accepted: (data) => ({
        subject: `🎉 Your application to "${data.projectTitle}" was accepted!`,
        html: `
            <h2>Congratulations! You've been accepted.</h2>
            <p>Your application to the project <strong>"${data.projectTitle}"</strong> has been accepted by the Brand.</p>
            <p>Head to your dashboard to join the workspace and get started!</p>
            <a href="${data.frontendUrl}/dashboard" style="background:#6366f1;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:16px;">Go to Dashboard →</a>
        `,
    }),
    milestone_approved: (data) => ({
        subject: `✅ Milestone Approved — Payment releasing for "${data.projectTitle}"`,
        html: `
            <h2>Milestone Approved!</h2>
            <p>Your milestone on <strong>"${data.projectTitle}"</strong> has been approved by the Brand.</p>
            <p>Your payment is now being processed and will appear in your Stripe account shortly.</p>
            <a href="${data.frontendUrl}/dashboard" style="background:#6366f1;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:16px;">View Details →</a>
        `,
    }),
    new_application: (data) => ({
        subject: `📬 New Application on "${data.projectTitle}"`,
        html: `
            <h2>Someone applied to your project!</h2>
            <p>A new creator has applied to your project <strong>"${data.projectTitle}"</strong>.</p>
            <p>Review their application and profile to decide if they're the right fit.</p>
            <a href="${data.frontendUrl}/projects/${data.projectId}" style="background:#6366f1;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:16px;">Review Application →</a>
        `,
    }),
    payment_sent: (data) => ({
        subject: `💰 Payment of ₹${data.amount} has been released!`,
        html: `
            <h2>You've been paid!</h2>
            <p>A payment of <strong>₹${data.amount}</strong> for your work on <strong>"${data.projectTitle}"</strong> has been released to your Stripe account.</p>
            <a href="${data.frontendUrl}/dashboard" style="background:#6366f1;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:16px;">View Dashboard →</a>
        `,
    }),
    new_invitation: (data) => ({
        subject: `✨ Specialized Invitation from ${data.brandName ?? 'a Brand'}: Join "${data.projectTitle}"`,
        html: `
            <h2>You've been personally approached!</h2>
            <p><strong>${data.brandName ?? 'A Brand'}</strong> has personally reached out to you for their project: <strong>"${data.projectTitle}"</strong>.</p>
            <p>They approached you because they viewed your profile and believe your specialized skills are a perfect match for their vision.</p>
            <p style="background:rgba(99,102,241,0.1); padding:15px; border-radius:8px; border-left:4px solid #6366f1; font-style:italic;">
                "This brand approach you to work for them, they viewed your profile and believe you are the right fit!"
            </p>
            <a href="${data.frontendUrl}/dashboard" style="background:#6366f1;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:16px;">View Invitation & Details →</a>
        `,
    }),
};

/**
 * Send a notification email to a user.
 * @param userId - The ID of the user to notify
 * @param type - The notification template type
 * @param data - Template variables (projectTitle, projectId, amount, etc.)
 */
export const notifyUser = async (
    userId: string,
    type: NotificationType,
    data: Record<string, string> = {}
): Promise<void> => {
    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return;

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const template = templates[type]({ ...data, frontendUrl });

        await sendEmail({
            to: user.email,
            subject: template.subject,
            html: template.html,
        });

        console.log(`✉️  Notification sent [${type}] to ${user.email}`);
    } catch (err) {
        // Log but never crash the main request if notification fails
        console.error(`Notification error [${type}]:`, err);
    }
};
