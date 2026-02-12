"use server";

import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";
import { createNotification } from "@/actions/notifications";
import { NotificationType } from "@/lib/prisma";

/**
 * Register a new user.
 */
export const register = async (values: any) => {
    const { email, password, name } = values;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const existingUser = await db.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return { error: "Email already in use!" };
        }

        const user = await db.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        const verificationToken = await generateVerificationToken(email);
        await sendVerificationEmail(verificationToken.identifier, verificationToken.token);

        // Notify admins about new registration
        try {
            const admins = await db.user.findMany({
                where: { role: "ADMIN" },
                select: { id: true }
            });

            for (const admin of admins) {
                await createNotification({
                    userId: admin.id,
                    title: "New User Registered",
                    message: `${name || email} has joined the platform.`,
                    type: NotificationType.SYSTEM,
                    href: "/admin/users",
                });
            }
        } catch (error) {
            console.error("[REGISTER_NOTIF_ERROR]", error);
        }

        return { success: "Confirmation email sent!" };
    } catch (error) {
        console.error("[REGISTER_ERROR]", error);
        return { error: "Something went wrong!" };
    }
};

/**
 * Login an existing user.
 */
export const login = async (values: any) => {
    const { email, password } = values;

    try {
        const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        if (result?.error) {
            return { error: "Invalid credentials!" };
        }

        return { success: "Logged in!" };
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return { error: "Invalid credentials!" };
                default:
                    return { error: "Something went wrong!" };
            }
        }

        // Re-throw if it's not an AuthError (unlikely with redirect: false)
        throw error;
    }
};

/**
 * Logout the current user.
 */
export const logout = async () => {
    await signOut({ redirectTo: "/auth/login" });
};
