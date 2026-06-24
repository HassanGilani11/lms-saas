"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { CouponType } from "@/lib/prisma";

export const getCoupons = async () => {
    try {
        const coupons = await db.coupon.findMany({
            orderBy: {
                createdAt: "desc",
            },
        });
        return coupons;
    } catch (error) {
        console.log("[GET_COUPONS]", error);
        return [];
    }
};

export const getCouponById = async (id: string) => {
    try {
        const coupon = await db.coupon.findUnique({
            where: { id },
        });
        return coupon;
    } catch (error) {
        console.log("[GET_COUPON_BY_ID]", error);
        return null;
    }
};

export interface CreateCouponProps {
    title: string;
    slug: string;
    code: string;
    type: CouponType;
    amount: number;
    maxRedemptions: number;
    startDate?: Date | null;
    endDate?: Date | null;
    applyToAllCourses: boolean;
    applyToAllGroups: boolean;
}

export const createCoupon = async (values: CreateCouponProps) => {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            throw new Error("Unauthorized");
        }

        const coupon = await db.coupon.create({
            data: {
                ...values,
            },
        });

        revalidatePath("/admin/coupons");
        return coupon;
    } catch (error) {
        console.log("[CREATE_COUPON]", error);
        return null;
    }
};

export const updateCoupon = async (id: string, values: Partial<CreateCouponProps>) => {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            throw new Error("Unauthorized");
        }

        const coupon = await db.coupon.update({
            where: { id },
            data: {
                ...values,
            },
        });

        revalidatePath("/admin/coupons");
        revalidatePath(`/admin/coupons/${id}`);
        return coupon;
    } catch (error) {
        console.log("[UPDATE_COUPON]", error);
        return null;
    }
};

export const deleteCoupon = async (id: string) => {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            throw new Error("Unauthorized");
        }

        const coupon = await db.coupon.delete({
            where: { id },
        });

        revalidatePath("/admin/coupons");
        return coupon;
    } catch (error) {
        console.log("[DELETE_COUPON]", error);
        return null;
    }
};
