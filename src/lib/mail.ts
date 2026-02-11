import nodemailer from "nodemailer";

const smtpConfig = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
};

const transporter = nodemailer.createTransport(smtpConfig);

export const sendVerificationEmail = async (email: string, token: string) => {
    const confirmLink = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/auth/new-verification?token=${token}`;

    try {
        await transporter.sendMail({
            from: process.env.SMTP_FROM || "onboarding@resend.dev",
            to: email,
            subject: "Confirm your email",
            html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                    <h2 style="color: #333;">Welcome to LMS SaaS!</h2>
                    <p>Please click the button below to verify your email address:</p>
                    <a href="${confirmLink}" style="display: inline-block; padding: 10px 20px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px; margin-top: 10px;">Verify Email</a>
                    <p style="font-size: 12px; color: #666; margin-top: 20px;">If the button doesn't work, copy and paste this link into your browser:</p>
                    <p style="font-size: 12px; color: #666;">${confirmLink}</p>
                </div>
            `,
        });
        return { success: true };
    } catch (error) {
        console.error("[SEND_EMAIL_ERROR]", error);
        return { success: false, error: "Failed to send verification email" };
    }
};
