import { UserRole } from "@/lib/prisma";
import { DefaultSession } from "next-auth";

export type ExtendedUser = DefaultSession["user"] & {
    role: UserRole;
    username?: string | null;
};

declare module "next-auth" {
    interface Session {
        user: ExtendedUser;
    }
}
