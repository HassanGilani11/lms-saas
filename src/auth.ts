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
        async jwt({ token, user }: any) {
            // Initial sign in
            if (user) {
                token.role = (user as any).role;
                token.id = user.id;
                token.username = (user as any).username;
                token.name = user.name;
                return token;
            }

            // Subsequent checks - fetch from DB if fields are missing or if we want to sync
            if (!token.name || !token.role) {
                try {
                    const dbUser = await db.user.findUnique({
                        where: { id: token.sub }
                    });

                    if (dbUser) {
                        token.role = dbUser.role;
                        token.username = dbUser.username;
                        token.name = dbUser.name;
                    }
                } catch {
                    return token;
                }
            }

            return token;
        },
        async session({ session, token }: any) {
            if (session.user) {
                if (token.sub) {
                    session.user.id = token.sub;
                }

                if (token.role) {
                    session.user.role = token.role as UserRole;
                }

                if (token.username) {
                    session.user.username = token.username as string;
                }

                if (token.name) {
                    session.user.name = token.name as string;
                }
            }

            return session;
        },
    },
    providers: [
        ...authConfig.providers,
        Credentials({
            async authorize(credentials) {
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
