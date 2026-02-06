"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export const createAttachment = async (values: { name: string; url: string; courseId?: string; topicId?: string }) => {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        if (!userId) {
            throw new Error("Unauthorized");
        }

        // Verify ownership (simplified check for now)
        // In a real app, you'd check if the course or topic belongs to the user or if they are admin

        const attachment = await db.attachment.create({
            data: {
                name: values.name,
                url: values.url,
                courseId: values.courseId,
                topicId: values.topicId,
            },
        });

        if (values.courseId) {
            revalidatePath(`/instructor/courses/${values.courseId}`);
            revalidatePath(`/admin/courses/${values.courseId}/edit`);
        }

        return attachment;
    } catch (error) {
        console.log("[CREATE_ATTACHMENT]", error);
        return null;
    }
};

export const deleteAttachment = async (attachmentId: string) => {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        if (!userId) {
            throw new Error("Unauthorized");
        }

        const attachment = await db.attachment.findUnique({
            where: {
                id: attachmentId,
            },
        });

        if (!attachment) {
            throw new Error("Not found");
        }

        const deletedAttachment = await db.attachment.delete({
            where: {
                id: attachmentId,
            },
        });

        if (attachment.courseId) {
            revalidatePath(`/instructor/courses/${attachment.courseId}`);
            revalidatePath(`/admin/courses/${attachment.courseId}/edit`);
        }

        return deletedAttachment;
    } catch (error) {
        console.log("[DELETE_ATTACHMENT]", error);
        return null;
    }
};
