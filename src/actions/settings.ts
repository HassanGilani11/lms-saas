"use server";
// Cache-buster: schema updated 2026-02-18

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath, unstable_cache, revalidateTag } from "next/cache";


export const getSettings = unstable_cache(
    async () => {
        try {
            let settings = await db.systemSettings.findUnique({
                where: { id: "default" },
            });

            if (!settings) {
                // Initialize default settings if they don't exist
                return await db.systemSettings.create({
                    data: {
                        id: "default",
                        siteName: "LMS SaaS",
                        stripeEnabled: true,
                        codEnabled: true,
                    },
                });
            }

            if (settings) {
                // Auto-sync rates if they are older than 24 hours
                const oneDayInMs = 24 * 60 * 60 * 1000;
                const isStale = !settings.ratesUpdatedAt ||
                    (new Date().getTime() - new Date(settings.ratesUpdatedAt).getTime() > oneDayInMs);

                if (isStale && settings.baseCurrency) {
                    try {
                        console.log("[GET_SETTINGS] Syncing stale rates...");
                        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${settings.baseCurrency}`);
                        const data = await response.json();
                        if (data.rates) {
                            const newRates = {
                                AUD: data.rates.AUD,
                                CAD: data.rates.CAD,
                                EUR: data.rates.EUR,
                                USD: data.rates.USD,
                            };

                            // Update DB directly without using updateSettings to avoid recursive loops/cache issues
                            const updated = await db.systemSettings.update({
                                where: { id: "default" },
                                data: {
                                    exchangeRates: newRates,
                                    ratesUpdatedAt: new Date(),
                                }
                            });
                            return updated;
                        }
                    } catch (syncError) {
                        console.error("[GET_SETTINGS] Auto-sync failed:", syncError);
                        // Continue returning stale settings if sync fails
                    }
                }
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
        console.log("[UPDATE_SETTINGS] Received data:", data);
        const session = await auth();
        if (session?.user?.role !== "ADMIN") {
            throw new Error("Unauthorized");
        }

        const settings = await db.systemSettings.upsert({
            where: { id: "default" },
            update: {
                ...data,
                // If exchangeRates are being updated manually/via sync button, update the timestamp
                ...(data.exchangeRates ? { ratesUpdatedAt: new Date() } : {})
            },
            create: {
                id: "default",
                ...data,
                ...(data.exchangeRates ? { ratesUpdatedAt: new Date() } : {})
            },
        });

        revalidatePath("/admin/settings");
        revalidatePath("/", "layout"); // Revalidate all pages to reflect branding changes
        // revalidateTag("settings"); // Invalidate the unstable_cache tag
        return { success: true, data: settings };

    } catch (error: any) {
        console.error("[UPDATE_SETTINGS] Error object:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
        return { success: false, error: error?.message || "Something went wrong" };
    }
};
