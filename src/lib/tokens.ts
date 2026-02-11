import { nanoid } from "nanoid";
import { db } from "@/lib/db";

export const generateVerificationToken = async (email: string) => {
    const token = nanoid(32);
    const expires = new Date(new Date().getTime() + 3600 * 1000); // 1 hour

    const existingToken = await db.verificationToken.findFirst({
        where: { identifier: email }
    });

    if (existingToken) {
        await db.verificationToken.delete({
            where: { token: existingToken.token }
        });
    }

    const verificationToken = await db.verificationToken.create({
        data: {
            identifier: email,
            token,
            expires,
        }
    });

    return verificationToken;
};

export const getVerificationTokenByToken = async (token: string) => {
    try {
        const verificationToken = await db.verificationToken.findUnique({
            where: { token }
        });
        return verificationToken;
    } catch {
        return null;
    }
};
