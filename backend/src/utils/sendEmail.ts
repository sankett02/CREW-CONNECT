import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export const sendEmail = async (options: EmailOptions) => {
  try {
    // Check if we have real SMTP credentials
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true", 
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const info = await transporter.sendMail({
        from: '"CrewConnect Support" <noreply@crewconnect.com>',
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });

      console.log("Real email sent via SMTP! Message ID:", info.messageId);
      return;
    }

    // Default: Mock email sending for local development since generating Ethereal accounts
    // on the fly can hang the request lifecycle due to rate limits or network blocks.
    console.log("\n=======================================================");
    console.log("             MOCK EMAIL SENT (LOCAL DEV)               ");
    console.log("=======================================================");
    console.log(`TO: ${options.to}`);
    console.log(`SUBJECT: ${options.subject}`);
    console.log("CONTENT:\n");
    console.log(options.html || options.text);
    console.log("=======================================================\n");

  } catch (error) {
    console.error("Error sending email: ", error);
    throw error;
  }
};
