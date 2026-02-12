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
export const sendEnrollmentEmail = async (
    email: string,
    courseTitle: string,
    amount: number,
    transactionId: string,
    password?: string
) => {
    try {
        await transporter.sendMail({
            from: process.env.SMTP_FROM || "onboarding@resend.dev",
            to: email,
            subject: `Enrollment Confirmation: ${courseTitle}`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px; max-width: 600px; margin: auto;">
                    <div style="background-color: #4f46e5; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
                        <h1 style="color: #fff; margin: 0; font-size: 24px;">Enrollment Successful!</h1>
                    </div>
                    <div style="padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
                        <h2 style="color: #111827; margin-top: 0;">Hi There,</h2>
                        <p style="color: #4b5563; line-height: 1.6;">
                            You've successfully enrolled in <strong>${courseTitle}</strong>. Your payment has been received and you can start learning immediately.
                        </p>
                        
                        ${password ? `
                        <div style="margin: 30px 0; padding: 20px; background-color: #fef2f2; border: 1px solid #fee2e2; border-radius: 8px;">
                            <h3 style="margin-top: 0; font-size: 14px; text-transform: uppercase; color: #991b1b; letter-spacing: 0.05em;">Your Login Credentials</h3>
                            <p style="font-size: 14px; color: #4b5563; margin-bottom: 10px;">A new account has been created for you. Use these details to log in:</p>
                            <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 10px 0; color: #374151;">Email</td>
                                    <td style="padding: 10px 0; text-align: right; font-weight: bold; color: #111827;">${email}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0; color: #374151;">Password</td>
                                    <td style="padding: 10px 0; text-align: right; font-weight: bold; color: #111827;">${password}</td>
                                </tr>
                            </table>
                            <p style="font-size: 12px; color: #991b1b; margin-top: 10px;"><strong>Important:</strong> Please change your password after your first login.</p>
                        </div>
                        ` : ""}

                        <div style="margin: 30px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
                            <h3 style="margin-top: 0; font-size: 14px; text-transform: uppercase; color: #6b7280; letter-spacing: 0.05em;">Order Details</h3>
                            <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 10px 0; color: #374151;">Course</td>
                                    <td style="padding: 10px 0; text-align: right; font-weight: bold; color: #111827;">${courseTitle}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0; color: #374151;">Amount Paid</td>
                                    <td style="padding: 10px 0; text-align: right; font-weight: bold; color: #111827;">$${amount.toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0; color: #374151;">Transaction ID</td>
                                    <td style="padding: 10px 0; text-align: right; font-family: monospace; color: #6b7280; font-size: 12px;">${transactionId}</td>
                                </tr>
                            </table>
                        </div>

                        <div style="text-align: center; margin-top: 30px;">
                            <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/auth/login" style="display: inline-block; padding: 14px 28px; background-color: #4f46e5; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold;">Login and Start Learning</a>
                        </div>
                        
                        <p style="font-size: 12px; color: #9ca3af; margin-top: 40px; text-align: center;">
                            If you have any questions, please reply to this email or contact support.
                        </p>
                    </div>
                </div>
            `,
        });
        return { success: true };
    } catch (error) {
        console.error("[SEND_ENROLLMENT_EMAIL_ERROR]", error);
        return { success: false, error: "Failed to send enrollment email" };
    }
};

export const sendPasswordResetEmail = async (
    email: string,
    token: string,
) => {
    const resetLink = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/auth/new-password?token=${token}`;

    try {
        await transporter.sendMail({
            from: process.env.SMTP_FROM || "onboarding@resend.dev",
            to: email,
            subject: "Reset your password",
            html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                    <h2 style="color: #333;">Reset Password</h2>
                    <p>Click the button below to reset your password:</p>
                    <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px; margin-top: 10px;">Reset Password</a>
                    <p style="font-size: 12px; color: #666; margin-top: 20px;">If the button doesn't work, copy and paste this link into your browser:</p>
                    <p style="font-size: 12px; color: #666;">${resetLink}</p>
                </div>
            `,
        });
        return { success: true };
    } catch (error) {
        console.error("[SEND_RESET_EMAIL_ERROR]", error);
        return { success: false, error: "Failed to send reset email" };
    }
};
