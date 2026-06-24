import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || process.env.STRIPE_API_KEY || "", {
    typescript: true,
});

console.log("[STRIPE_LIB] Stripe initialized with key starting with:", (process.env.STRIPE_SECRET_KEY || process.env.STRIPE_API_KEY)?.slice(0, 7));
