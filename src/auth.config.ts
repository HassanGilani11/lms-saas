import type { NextAuthConfig } from "next-auth";
import Github from "next-auth/providers/github";
import Google from "next-auth/providers/google";

export default {
    callbacks: {
        async jwt({ token, user }: any) {
            if (user) {
                token.role = (user as any).role;
                token.id = user.id;
                token.username = (user as any).username;
                token.name = user.name;
            }
            return token;
        },
        async session({ session, token }: any) {
            if (session.user) {
                if (token.sub) {
                    session.user.id = token.sub;
                }

                if (token.role) {
                    session.user.role = token.role;
                }

                if (token.username) {
                    session.user.username = token.username;
                }

                if (token.name) {
                    session.user.name = token.name;
                }
            }
            return session;
        },
    },
    providers: [], // Add OAuth providers here when credentials are ready
} satisfies NextAuthConfig;
