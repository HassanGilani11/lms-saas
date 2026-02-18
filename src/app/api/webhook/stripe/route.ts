import { db } from "@/lib/db";
import { sendEnrollmentEmail } from "@/lib/mail";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { fulfillStripeCheckout } from "@/actions/fulfillment";


export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    console.log("[STRIPE_WEBHOOK] Received request");
    const body = await req.text();
    const signature = (await headers()).get("Stripe-Signature") as string;

    console.log("[STRIPE_WEBHOOK] Secret exists:", !!process.env.STRIPE_WEBHOOK_SECRET);
    console.log("[STRIPE_WEBHOOK] Signature exists:", !!signature);

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
        console.log("[STRIPE_WEBHOOK] Event constructed:", event.type);
    } catch (error: any) {
        console.log("[STRIPE_WEBHOOK] Construction Error:", error.message);
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    if (event.type === "checkout.session.completed") {
        if (session.mode === "subscription") {
            const subscription = await stripe.subscriptions.retrieve(
                session.subscription as string
            );

            if (!session?.metadata?.userId) {
                return new NextResponse("User id is required for subscriptions", { status: 400 });
            }

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
            console.log("[STRIPE_WEBHOOK] Delegating fulfillment to action");
            const result = await fulfillStripeCheckout(session.id);
            console.log("[STRIPE_WEBHOOK] Fulfillment action outcome:", result);
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
