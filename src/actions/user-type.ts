"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export const createUserType = async (values: {
    firstName: string;
    lastName: string;
    role: any;
    permissions: any;
}) => {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            throw new Error("Unauthorized");
        }

        const userType = await db.userType.create({
            data: {
                ...values,
            },
        });

        revalidatePath("/admin/user-types");
        return userType;
    } catch (error) {
        console.log("[CREATE_USER_TYPE]", error);
        return null;
    }
};

export const getUserTypes = async () => {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            throw new Error("Unauthorized");
        }

        return await db.userType.findMany({
            orderBy: { createdAt: "desc" },
        });
    } catch (error) {
        console.log("[GET_USER_TYPES]", error);
        return [];
    }
};
