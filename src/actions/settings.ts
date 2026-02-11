"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath, unstable_cache, revalidateTag } from "next/cache";

export const getSettings = unstable_cache(
    async () => {
        try {
            const settings = await db.systemSettings.findUnique({
                where: { id: "default" },
            });

            if (!settings) {
                // Initialize default settings if they don't exist
                return await db.systemSettings.create({
                    data: {
                        id: "default",
                        siteName: "LMS SaaS",
                    },
                });
            }

            return settings;
        } catch (error) {
            console.error("[GET_SETTINGS]", error);
            return null;
        }
    },
    ["system-settings"],
    { revalidate: 3600, tags: ["settings"] }
);

export const updateSettings = async (data: any) => {
    try {
        const session = await auth();
        if (session?.user?.role !== "ADMIN") {
            throw new Error("Unauthorized");
        }

        const settings = await db.systemSettings.upsert({
            where: { id: "default" },
            update: data,
            create: {
                id: "default",
                ...data,
            },
        });

        revalidatePath("/admin/settings");
        revalidatePath("/", "layout"); // Revalidate all pages to reflect branding changes
        revalidateTag("settings", "default"); // Invalidate the unstable_cache tag
        return { success: true, data: settings };
    } catch (error) {
        console.error("[UPDATE_SETTINGS]", error);
        return { success: false, error: "Something went wrong" };
    }
};
