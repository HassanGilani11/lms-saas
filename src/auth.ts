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
