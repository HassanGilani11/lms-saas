"use server";

import { db } from "@/lib/db";
import { getVerificationTokenByToken } from "@/lib/tokens";

export const newVerification = async (token: string) => {
    const existingToken = await getVerificationTokenByToken(token);

    if (!existingToken) {
        return { error: "Token does not exist!" };
    }

    const hasExpired = new Date(existingToken.expires) < new Date();

    if (hasExpired) {
        return { error: "Token has expired!" };
    }

    const existingUser = await db.user.findUnique({
        where: { email: existingToken.identifier }
    });

    if (!existingUser) {
        return { error: "Email does not exist!" };
    }

    await db.user.update({
        where: { id: existingUser.id },
        data: {
            emailVerified: new Date(),
            email: existingToken.identifier,
        }
    });

    await db.verificationToken.delete({
        where: { token }
    });

    return { success: "Email verified!" };
};
