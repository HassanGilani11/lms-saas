"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NotificationType } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { notificationEmitter } from "@/lib/events";

/**
 * Fetch notifications for the current user.
 */
export const getNotifications = async (limit = 20) => {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        if (!userId) return [];

        return await db.notification.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: limit
        });
    } catch (error) {
        console.error("[GET_NOTIFICATIONS]", error);
        return [];
    }
};

/**
 * Mark specific notifications as read.
 */
export const markNotificationsAsRead = async (ids: string[]) => {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        if (!userId) return { success: false };

        await db.notification.updateMany({
            where: {
                id: { in: ids },
                userId
            },
            data: { isRead: true }
        });

        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("[MARK_NOTIFICATIONS_READ]", error);
        return { success: false };
    }
};

/**
 * Get notification preferences for the current user.
 */
export const getNotificationPreferences = async () => {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        if (!userId) return [];

        return await db.notificationPreference.findMany({
            where: { userId }
        });
    } catch (error) {
        console.error("[GET_NOTIF_PREFS]", error);
        return [];
    }
};

/**
 * Update a specific notification preference.
 */
export const updateNotificationPreference = async (type: NotificationType, enabled: boolean, emailEnabled?: boolean) => {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        if (!userId) return { success: false };

        await db.notificationPreference.upsert({
            where: {
                userId_type: {
                    userId,
                    type
                }
            },
            update: {
                enabled,
                ...(emailEnabled !== undefined && { emailEnabled })
            },
            create: {
                userId,
                type,
                enabled,
                emailEnabled: emailEnabled || false
            }
        });

        return { success: true };
    } catch (error) {
        console.error("[UPDATE_NOTIF_PREF]", error);
        return { success: false };
    }
};

/**
 * Internal utility to create a notification.
 * Triggered by other server actions.
 */
export const createNotification = async (data: {
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    href?: string;
    metadata?: any;
}) => {
    try {
        // Check preferences first
        const pref = await db.notificationPreference.findUnique({
            where: {
                userId_type: {
                    userId: data.userId,
                    type: data.type
                }
            }
        });

        if (pref && !pref.enabled) {
            return null; // Notification disabled by user
        }

        const notification = await db.notification.create({
            data: {
                userId: data.userId,
                title: data.title,
                message: data.message,
                type: data.type,
                href: data.href,
                metadata: data.metadata || {}
            }
        });

        notificationEmitter.emit("notification", notification);
        revalidatePath("/");

        return notification;
    } catch (error) {
        console.error("[CREATE_NOTIFICATION]", error);
        return null;
    }
};
