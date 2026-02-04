import type { NextAuthConfig } from "next-auth";
import Github from "next-auth/providers/github";
import Google from "next-auth/providers/google";

export default {
    callbacks: {
        async jwt({ token, user }: any) {
            if (user) {
                token.role = (user as any).role;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }: any) {
            if (session.user) {
                if (token.role) {
                    session.user.role = token.role;
                }
                if (token.id) {
                    session.user.id = token.id;
                } else if (token.sub) {
                    session.user.id = token.sub;
                }
            }
            return session;
        },
    },
    providers: [
        Github,
        Google,
    ],
} satisfies NextAuthConfig;
