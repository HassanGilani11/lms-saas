"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { UserRole } from "@/lib/prisma";
import bcrypt from "bcryptjs";

/**
 * Get users for admin dashboard with optional role filter.
 */
export const getUsers = async (role?: UserRole) => {
    try {
        const session = await auth();
        console.log("[GET_USERS] Checking session:", session?.user?.email, "Role:", session?.user?.role);

        if (!session?.user || session.user.role !== "ADMIN") {
            console.log("[GET_USERS] Unauthorized access attempt");
            throw new Error("Unauthorized");
        }

        const users = await db.user.findMany({
            where: role ? { role } : {},
            orderBy: { createdAt: "desc" },
        });

        console.log(`[GET_USERS] Found ${users.length} users with role ${role || "ANY"}`);
        return users;
    } catch (error) {
        console.log("[GET_USERS] Error:", error);
        return [];
    }
};

/**
 * Get current logged in user details.
 */
export const getCurrentUser = async () => {
    try {
        const session = await auth();
        if (!session?.user?.id) return null;

        return await db.user.findUnique({
            where: { id: session.user.id }
        });
    } catch (error) {
        console.log("[GET_CURRENT_USER]", error);
        return null;
    }
};

/**
 * Update current logged in user details.
 */
export const updateCurrentUser = async (values: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string
}) => {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        const updatedUser = await db.user.update({
            where: { id: session.user.id },
            data: { ...values },
        });

        revalidatePath("/admin/users/my-info");
        return updatedUser;
    } catch (error) {
        console.log("[UPDATE_CURRENT_USER]", error);
        return null;
    }
};

/**
 * Toggle user role (ADMIN, INSTRUCTOR, STUDENT).
 */
export const toggleUserRole = async (userId: string, role: UserRole) => {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            throw new Error("Unauthorized");
        }

        const updatedUser = await db.user.update({
            where: { id: userId },
            data: { role },
        });

        revalidatePath("/admin/users");
        return updatedUser;
    } catch (error) {
        console.log("[TOGGLE_USER_ROLE]", error);
        return null;
    }
};

/**
 * Delete a user.
 */
export const deleteUser = async (userId: string) => {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            throw new Error("Unauthorized");
        }

        const deletedUser = await db.user.delete({
            where: { id: userId },
        });

        revalidatePath("/admin/users");
        return deletedUser;
    } catch (error) {
        console.log("[DELETE_USER]", error);
        return null;
    }
};

/**
 * Update user details (Admin only).
 */
export const updateUser = async (userId: string, values: { name?: string; email?: string; role?: UserRole; phone?: string; address?: string }) => {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            throw new Error("Unauthorized");
        }

        const updatedUser = await db.user.update({
            where: { id: userId },
            data: { ...values },
        });

        revalidatePath("/admin/users");
        revalidatePath("/admin/users/instructor");
        revalidatePath("/admin/users/learner");
        return { success: true, data: updatedUser };
    } catch (error) {
        console.log("[UPDATE_USER]", error);
        return { success: false, error: "Failed to update user" };
    }
};

/**
 * Create a new user (Admin only).
 */
export const createUser = async (values: { name: string; email: string; role: UserRole; phone?: string; address?: string }) => {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            throw new Error("Unauthorized");
        }

        const hashedPassword = await bcrypt.hash("password123", 10);

        const newUser = await db.user.create({
            data: {
                ...values,
                password: hashedPassword,
            },
        });

        revalidatePath("/admin/users");
        revalidatePath("/admin/users/instructor");
        revalidatePath("/admin/users/learner");
        return { success: true, data: newUser };
    } catch (error: any) {
        console.log("[CREATE_USER] Error detail:", error);
        if (error?.code === "P2002") {
            return { success: false, error: "Email already exists" };
        }
        return { success: false, error: error.message || "Failed to create user" };
    }
};
