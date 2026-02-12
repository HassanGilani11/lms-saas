"use server";

import * as z from "zod";

import { generatePasswordResetToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/mail";
import { db } from "@/lib/db";


const ResetSchema = z.object({
    email: z.string().email({
        message: "Email is required",
    }),
});

export const reset = async (values: z.infer<typeof ResetSchema>) => {
    const validatedFields = ResetSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Invalid email!" };
    }

    const { email } = validatedFields.data;

    const existingUser = await db.user.findUnique({
        where: { email }
    });

    if (!existingUser) {
        return { error: "Email not found!" };
    }

    // Generate token and send email
    const passwordResetToken = await generatePasswordResetToken(email);
    await sendPasswordResetEmail(passwordResetToken.email, passwordResetToken.token);

    return { success: "Reset email sent!" };
};
