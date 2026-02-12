import { db } from "@/lib/db";
import { sendEnrollmentEmail } from "@/lib/mail";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get("Stripe-Signature") as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (error: any) {
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    if (event.type === "checkout.session.completed") {
        const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
        );

        if (!session?.metadata?.userId) {
            return new NextResponse("User id is required", { status: 400 });
        }

        if (session.mode === "subscription") {
            await db.stripeSubscription.create({
                data: {
                    userId: session.metadata.userId,
                    stripeSubscriptionId: subscription.id,
                    stripePriceId: (subscription as any).items.data[0].price.id,
                    stripeCurrentPeriodEnd: new Date(
                        (subscription as any).current_period_end * 1000
                    ),
                },
            });
        } else {
            // One-time purchase completion
            let userId = session?.metadata?.userId;
            const courseId = session?.metadata?.courseId;

            if (!courseId) {
                return new NextResponse("Course id is required", { status: 400 });
            }

            // Handle Guest Checkout (missing userId)
            if (!userId) {
                const email = session.customer_details?.email || session.customer_email;
                if (!email) {
                    return new NextResponse("Email is required for guest checkout", { status: 400 });
                }

                // Ensure user exists (idempotent)
                const userKey = await db.user.findUnique({ where: { email } });
                if (userKey) {
                    userId = userKey.id;
                } else {
                    const newUser = await db.user.create({
                        data: {
                            email,
                            role: "STUDENT",
                        }
                    });
                    userId = newUser.id;
                }
            }

            // Ensure purchase (idempotent check)
            const existingPurchase = await db.purchase.findUnique({
                where: {
                    userId_courseId: {
                        userId: userId!,
                        courseId,
                    }
                }
            });

            if (!existingPurchase) {
                await db.purchase.create({
                    data: {
                        courseId: courseId,
                        userId: userId!,
                        amount: session.amount_total ? session.amount_total / 100 : 0,
                        currency: session.currency?.toUpperCase() || "USD",
                        stripeSessionId: session.id,
                        stripePaymentIntentId: session.payment_intent as string,
                        status: "COMPLETED",
                        type: "STRIPE",
                    },
                });

                // Send email
                const userEmail = session.customer_details?.email || session.customer_email;
                if (userEmail) {
                    await sendEnrollmentEmail(
                        userEmail,
                        session.metadata?.courseTitle || "your course",
                        session.amount_total ? session.amount_total / 100 : 0,
                        session.id
                    );
                }
            }
        }
    }

    if (event.type === "invoice.payment_succeeded") {
        const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
        );

        await db.stripeSubscription.update({
            where: {
                stripeSubscriptionId: subscription.id,
            },
            data: {
                stripePriceId: (subscription as any).items.data[0].price.id,
                stripeCurrentPeriodEnd: new Date(
                    (subscription as any).current_period_end * 1000
                ),
            },
        });
    }

    return new NextResponse(null, { status: 200 });
}
