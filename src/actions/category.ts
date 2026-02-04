"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export const createCategory = async (name: string) => {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            throw new Error("Unauthorized");
        }

        const category = await db.category.create({
            data: { name },
        });

        revalidatePath("/admin/categories");
        return category;
    } catch (error) {
        console.log("[CREATE_CATEGORY]", error);
        return null;
    }
};

export const updateCategory = async (id: string, name: string) => {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            throw new Error("Unauthorized");
        }

        const category = await db.category.update({
            where: { id },
            data: { name },
        });

        revalidatePath("/admin/categories");
        return category;
    } catch (error) {
        console.log("[UPDATE_CATEGORY]", error);
        return null;
    }
};

export const deleteCategory = async (id: string) => {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            throw new Error("Unauthorized");
        }

        const category = await db.category.delete({
            where: { id },
        });

        revalidatePath("/admin/categories");
        return category;
    } catch (error) {
        console.log("[DELETE_CATEGORY]", error);
        return null;
    }
};

export const getCategories = async () => {
    try {
        return await db.category.findMany({
            orderBy: { name: "asc" },
            include: {
                _count: {
                    select: { courses: true }
                }
            }
        });
    } catch (error) {
        console.log("[GET_CATEGORIES]", error);
        return [];
    }
};
