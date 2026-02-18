"use server";

import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { sendEnrollmentEmail } from "@/lib/mail";
import bcrypt from "bcryptjs";

export const ensureGuestUser = async (sessionId: string) => {
    console.log("[GUEST_ACTION] Processing sessionId:", sessionId);
    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        console.log("[GUEST_ACTION] Retrieved session for email:", session.customer_details?.email);

        if (!session || session.payment_status !== "paid") {
            return { error: "Payment not verified" };
        }

        const email = session.customer_details?.email || session.customer_email;
        if (!email) {
            return { error: "No email found in session" };
        }

        // 1. Ensure User Exists
        let user = await db.user.findUnique({
            where: { email },
        });

        let generatedPassword = "";

        if (!user || (user && !user.password)) {
            generatedPassword = Math.random().toString(36).slice(-10);
            const hashedPassword = await bcrypt.hash(generatedPassword, 10);

            if (!user) {
                user = await db.user.create({
                    data: {
                        email,
                        password: hashedPassword,
                        role: "STUDENT",
                    },
                });
            } else {
                // User existed (maybe via webhook) but has no password
                user = await db.user.update({
                    where: { id: user.id },
                    data: { password: hashedPassword }
                });
            }
        }

        // 2. Ensure Purchase Exists
        const courseId = session.metadata?.courseId;
        if (!courseId) {
            return { error: "No course ID in metadata" };
        }

        const existingPurchase = await db.purchase.findUnique({
            where: {
                userId_courseId: {
                    userId: user.id,
                    courseId,
                },
            },
        });

        if (!existingPurchase) {
            await db.purchase.create({
                data: {
                    userId: user.id,
                    courseId,
                    amount: session.amount_total ? session.amount_total / 100 : 0,
                    currency: session.currency?.toUpperCase() || "USD",
                    stripeSessionId: session.id,
                    stripePaymentIntentId: session.payment_intent as string,
                    status: "COMPLETED",
                    type: "STRIPE",
                },
            });

            // Send email only if we just created the purchase (avoid duplicates)
            await sendEnrollmentEmail(
                user.email!,
                session.metadata?.courseTitle || "Course",
                session.amount_total ? session.amount_total / 100 : 0,
                session.id,
                generatedPassword || undefined
            );
        }

        return { success: true, email: user.email };
    } catch (error) {
        console.error("Error ensuring guest user:", error);
        return { error: "Internal server error" };
    }
};
