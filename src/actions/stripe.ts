"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { redirect } from "next/navigation";
import { getSettings } from "@/actions/settings";

/**
 * Create a Stripe Checkout Session for a one-time course purchase.
 */
export const createCheckoutSession = async (courseId: string) => {
    console.log("[STRIPE_CHECKOUT] Starting session creation for courseId:", courseId);
    console.log("[STRIPE_CHECKOUT] STRIPE_SECRET_KEY starts with:", process.env.STRIPE_SECRET_KEY?.slice(0, 7) || "MISSING");
    console.log("[STRIPE_CHECKOUT] NEXT_PUBLIC_APP_URL:", process.env.NEXT_PUBLIC_APP_URL || "MISSING");

    try {
        const settings = await getSettings();
        const currency = settings?.stripeCurrency || "USD";

        const session = await auth();
        const user = session?.user;
        const userId = user?.id;
        const userEmail = user?.email;
        const isGuest = !user || !userId || !userEmail;

        // If not a guest, verify existing purchase
        if (!isGuest && userId) {
            const purchase = await db.purchase.findUnique({
                where: {
                    userId_courseId: {
                        userId,
                        courseId,
                    },
                },
            });

            if (purchase) {
                return { url: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${courseId}` }; // Redirect to course if owned
            }
        }

        const course = await db.course.findUnique({
            where: { id: courseId, isPublished: true },
        });

        if (!course) {
            console.log("[STRIPE_CHECKOUT] Course not found or not published:", courseId);
            throw new Error("Course not found");
        }

        console.log("[STRIPE_CHECKOUT] Creating session for course:", course.title);

        let customerId: string | undefined;

        if (!isGuest && userId && userEmail) {
            const stripeCustomer = await db.stripeCustomer.findUnique({
                where: { userId },
                select: { stripeCustomerId: true },
            });

            if (stripeCustomer) {
                customerId = stripeCustomer.stripeCustomerId;
            } else {
                const customer = await stripe.customers.create({
                    email: userEmail,
                    metadata: {
                        userId,
                    },
                });

                await db.stripeCustomer.create({
                    data: {
                        userId,
                        stripeCustomerId: customer.id,
                    },
                });
                customerId = customer.id;
            }
        }

        const exchangeRates = settings?.exchangeRates as any || {};
        const baseCurrency = settings?.baseCurrency || "USD";

        let unitAmount = Math.round(course.price! * 100);
        if (currency !== baseCurrency && exchangeRates[currency]) {
            const rate = exchangeRates[currency];
            unitAmount = Math.round((course.price! * rate) * 100);
        }

        const line_items = [
            {
                quantity: 1,
                price_data: {
                    currency: currency.toLowerCase(),
                    product_data: {
                        name: course.title,
                        description: course.description || "No description provided",
                    },
                    unit_amount: unitAmount,
                },
            },
        ];

        let stripeSession;

        if (isGuest) {
            stripeSession = await stripe.checkout.sessions.create({
                line_items,
                mode: "payment",
                success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}&courseId=${courseId}&is_guest=1`,
                cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel?courseId=${courseId}`,
                metadata: {
                    courseId: courseId,
                    courseTitle: course.title,
                    instructorId: course.userId,
                    isGuest: "true",
                },
                customer_creation: "always", // Create customer for guest
            });
        } else {
            stripeSession = await stripe.checkout.sessions.create({
                customer: customerId,
                line_items,
                mode: "payment",
                success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}&courseId=${courseId}`,
                cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel?courseId=${courseId}`,
                metadata: {
                    courseId: courseId,
                    userId: userId as string,
                    courseTitle: course.title,
                    instructorId: course.userId,
                },
            });
        }

        return { url: stripeSession.url };
    } catch (error: any) {
        console.log("[STRIPE_CHECKOUT] ERROR:", error.message || error);
        return null;
    }
};

/**
 * Create a Stripe Checkout Session for a subscription plan.
 */
export const createSubscriptionSession = async (priceId: string) => {
    try {
        const session = await auth();
        const user = session?.user;

        if (!user || !user.id || !user.email) {
            throw new Error("Unauthorized");
        }

        let stripeCustomer = await db.stripeCustomer.findUnique({
            where: { userId: user.id },
            select: { stripeCustomerId: true },
        });

        if (!stripeCustomer) {
            const customer = await stripe.customers.create({
                email: user.email,
            });

            stripeCustomer = await db.stripeCustomer.create({
                data: {
                    userId: user.id,
                    stripeCustomerId: customer.id,
                },
            });
        }

        const stripeSession = await stripe.checkout.sessions.create({
            customer: stripeCustomer.stripeCustomerId,
            billing_address_collection: "auto",
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: "subscription",
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=1`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=1`,
            metadata: {
                userId: user.id,
            },
        });

        return { url: stripeSession.url };
    } catch (error) {
        console.log("[STRIPE_SUBSCRIPTION]", error);
        return null;
    }
};
