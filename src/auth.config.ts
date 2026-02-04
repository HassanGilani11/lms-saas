import type { NextAuthConfig } from "next-auth";
import Github from "next-auth/providers/github";
import Google from "next-auth/providers/google";

export default {
    callbacks: {
        async jwt({ token, user }: any) {
            if (user) {
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }: any) {
            if (token.role && session.user) {
                session.user.role = token.role;
            }
            return session;
        },
    },
    providers: [
        Github,
        Google,
    ],
} satisfies NextAuthConfig;
