
import "dotenv/config";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

async function main() {
    const sessions = await stripe.checkout.sessions.list({ limit: 5 });

    console.log("Last 5 Sessions Metadata:");
    sessions.data.forEach(s => {
        console.log(`Session: ${s.id}`);
        console.log(`Email: ${s.customer_details?.email || s.customer_email}`);
        console.log(`Metadata:`, JSON.stringify(s.metadata, null, 2));
        console.log(`Payment Status: ${s.payment_status}`);
        console.log('---');
    });
}

main().catch(console.error);
