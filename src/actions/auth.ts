"use server";

import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";

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

        await db.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        // After registration, sign the user in
        return await login({ email, password });
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
        await signIn("credentials", {
            email,
            password,
            redirectTo: "/dashboard",
        });

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

        throw error;
    }
};

/**
 * Logout the current user.
 */
export const logout = async () => {
    await signOut({ redirectTo: "/auth/login" });
};
