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
        async session({ token, session }: any) {
            if (session.user) {
                if (token.sub) {
                    session.user.id = token.sub;
                }

                if (token.role) {
                    session.user.role = token.role as UserRole;
                }
            }

            return session;
        },
        async jwt({ token, user }: any) {
            if (user) {
                token.role = (user as any).role;
                return token;
            }

            if (!token.role && token.sub) {
                try {
                    const existingUser = await db.user.findUnique({
                        where: { id: token.sub },
                    });

                    if (existingUser) {
                        token.role = existingUser.role;
                    }
                } catch (error) {
                    console.error("JWT CALLBACK ERROR", error);
                }
            }

            return token;
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
