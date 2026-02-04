"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { redirect } from "next/navigation";

/**
 * Create a Stripe Checkout Session for a one-time course purchase.
 */
export const createCheckoutSession = async (courseId: string) => {
    try {
        const session = await auth();
        const user = session?.user;

        if (!user || !user.id || !user.email) {
            throw new Error("Unauthorized");
        }

        const course = await db.course.findUnique({
            where: { id: courseId, isPublished: true },
        });

        if (!course) {
            throw new Error("Course not found");
        }

        const purchase = await db.purchase.findUnique({
            where: {
                userId_courseId: {
                    userId: user.id,
                    courseId,
                },
            },
        });

        if (purchase) {
            throw new Error("Already purchased");
        }

        let stripeCustomer = await db.stripeCustomer.findUnique({
            where: { userId: user.id },
            select: { stripeCustomerId: true },
        });

        if (!stripeCustomer) {
            const customer = await stripe.customers.create({
                email: user.email,
                metadata: {
                    userId: user.id,
                },
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
            line_items: [
                {
                    quantity: 1,
                    price_data: {
                        currency: "USD",
                        product_data: {
                            name: course.title,
                            description: course.description!,
                        },
                        unit_amount: Math.round(course.price! * 100),
                    },
                },
            ],
            mode: "payment",
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${courseId}?success=1`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${courseId}?canceled=1`,
            metadata: {
                courseId: courseId,
                userId: user.id,
            },
        });

        return { url: stripeSession.url };
    } catch (error) {
        console.log("[STRIPE_CHECKOUT]", error);
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
