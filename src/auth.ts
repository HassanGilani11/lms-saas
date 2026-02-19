import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import authConfig from "@/auth.config";
import { UserRole } from "@/lib/prisma";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const {
    handlers,
    auth,
    signIn,
    signOut,
} = NextAuth({
    ...authConfig,
    adapter: PrismaAdapter(db as any),
    secret: process.env.AUTH_SECRET,
    trustHost: true,
    session: { strategy: "jwt" },
    callbacks: {
        async jwt({ token, user, trigger, session }: any) {
            // Initial sign in
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
                token.username = (user as any).username;
                token.name = user.name;
                token.email = user.email;
                token.picture = user.image;
                return token;
            }

            // Handle session update trigger
            if (trigger === "update" && session) {
                if (session.name !== undefined) token.name = session.name;
                if (session.image !== undefined) token.picture = session.image;
                if (session.username !== undefined) token.username = session.username;
                if (session.role !== undefined) token.role = session.role;
                return token;
            }

            // Subsequent checks - fetch from DB if fields are missing
            if (!token.role || !token.email) {
                try {
                    const dbUser = await db.user.findUnique({
                        where: { id: token.sub || token.id }
                    });

                    if (dbUser) {
                        token.role = dbUser.role;
                        token.username = dbUser.username;
                        token.name = dbUser.name;
                        token.email = dbUser.email;
                        token.picture = dbUser.image;
                    }
                } catch {
                    return token;
                }
            }

            return token;
        },
        async session({ session, token }: any) {
            if (session.user) {
                if (token.sub || token.id) {
                    session.user.id = token.sub || token.id;
                }

                if (token.role) {
                    session.user.role = token.role as UserRole;
                }

                if (token.username) {
                    session.user.username = token.username as string;
                }

                if (token.name !== undefined) {
                    session.user.name = token.name as string;
                }

                if (token.picture !== undefined) {
                    session.user.image = token.picture as string;
                }

                if (token.email !== undefined) {
                    session.user.email = token.email as string;
                }
            }

            return session;
        },
    },
    providers: [
        ...authConfig.providers,
        Credentials({
            async authorize(credentials) {
                // Auto-login via Stripe Session
                if (credentials.stripeSessionId) {
                    try {
                        const { stripe } = await import("@/lib/stripe");
                        const sessionId = credentials.stripeSessionId as string;
                        const session = await stripe.checkout.sessions.retrieve(sessionId);

                        if (!session || session.payment_status !== "paid") {
                            return null;
                        }

                        // The user should have been created by the webhook or the ensureGuestUser action
                        // We can look up by email if metadata.userId is missing (legacy/guest flow)
                        const email = session.customer_details?.email || session.customer_email;
                        if (!email) return null;

                        const user = await db.user.findUnique({
                            where: { email }
                        });

                        return user;
                    } catch (error) {
                        console.log("Stripe login error:", error);
                        return null;
                    }
                }

                const { email, password } = credentials as any;

                if (!email || !password) return null;

                const user = await db.user.findUnique({
                    where: { email },
                });

                if (!user || !user.password) return null;

                const passwordsMatch = await bcrypt.compare(password, user.password);

                if (passwordsMatch) return user;

                return null;
            },
        }),
    ],
});
