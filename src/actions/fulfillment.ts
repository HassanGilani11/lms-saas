"use server";

import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { sendEnrollmentEmail } from "@/lib/mail";
import bcrypt from "bcryptjs";
import { createNotification } from "@/actions/notifications";
import { NotificationType } from "@/lib/prisma";

/**
 * Fulfills a purchase after a successful Stripe Checkout Session.
 * This can be called by the webhook or the success page as a fallback.
 */
export const fulfillStripeCheckout = async (sessionId: string) => {
    console.log("[FULFILLMENT] Processing sessionId:", sessionId);
    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        const email = session.customer_details?.email || session.customer_email;

        console.log("[FULFILLMENT] Retrieved session for email:", email);

        if (!session || session.payment_status !== "paid") {
            console.log("[FULFILLMENT] Skip: Payment not paid");
            return { error: "Payment not verified" };
        }

        if (!email) {
            console.log("[FULFILLMENT] Error: No email in session");
            return { error: "No email found in session" };
        }

        // 1. Ensure User Exists
        let user = await db.user.findUnique({
            where: { email },
        });

        let generatedPassword = "";

        if (!user || (user && !user.password)) {
            console.log("[FULFILLMENT] User needs password/account creation");
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
                console.log("[FULFILLMENT] Created new user:", user.id);
            } else {
                user = await db.user.update({
                    where: { id: user.id },
                    data: { password: hashedPassword }
                });
                console.log("[FULFILLMENT] Updated existing user with password:", user.id);
            }
        }

        // 2. Ensure Purchase Exists
        const courseId = session.metadata?.courseId;
        if (!courseId) {
            console.log("[FULFILLMENT] Error: No courseId in metadata");
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
            console.log("[FULFILLMENT] Creating purchase record for courseId:", courseId);
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

            // Send enrollment email
            await sendEnrollmentEmail(
                user.email!,
                session.metadata?.courseTitle || "Course",
                session.amount_total ? session.amount_total / 100 : 0,
                session.id,
                generatedPassword || undefined
            );

            // 3. Create Notifications
            try {
                const courseTitle = session.metadata?.courseTitle || "Course";

                // Notify Student
                await createNotification({
                    userId: user.id,
                    title: "Enrollment Successful",
                    message: `You have successfully enrolled in "${courseTitle}". Happy learning!`,
                    type: NotificationType.ENROLLMENT,
                    href: `/courses/${courseId}`,
                    metadata: { courseId }
                });

                // Notify Admins
                const admins = await db.user.findMany({
                    where: { role: "ADMIN" },
                    select: { id: true }
                });

                for (const admin of admins) {
                    await createNotification({
                        userId: admin.id,
                        title: "New Stripe Enrollment",
                        message: `${email} enrolled in "${courseTitle}" via Stripe.`,
                        type: NotificationType.ENROLLMENT,
                        href: "/admin/payments",
                        metadata: { purchaseId: session.id }
                    });
                }

                // Notify Instructor
                const course = await db.course.findUnique({
                    where: { id: courseId },
                    select: { userId: true }
                });

                if (course) {
                    await createNotification({
                        userId: course.userId,
                        title: "New Enrollment",
                        message: `${email} enrolled in your course "${courseTitle}" via Stripe.`,
                        type: NotificationType.ENROLLMENT,
                        href: "/instructor/courses",
                        metadata: { courseId }
                    });
                }
            } catch (notifError) {
                console.error("[FULFILLMENT_NOTIF_ERROR]", notifError);
            }

            console.log("[FULFILLMENT] Success: Email sent and purchase created");
        } else {
            console.log("[FULFILLMENT] Skip: Purchase already exists");
        }

        return { success: true, email: user.email };
    } catch (error) {
        console.error("[FULFILLMENT] ERROR:", error);
        return { error: "Internal server error" };
    }
};
