"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { checkAndIssueCertificate } from "@/actions/certificate";
import { createNotification } from "@/actions/notifications";
import { NotificationType } from "@/lib/prisma";
import { sendEnrollmentEmail } from "@/lib/mail";

/**
 * Enroll a user in a course by creating a Purchase record.
 */
export const enrollInCourse = async (courseId: string) => {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        if (!userId) {
            throw new Error("Unauthorized");
        }

        const course = await db.course.findUnique({
            where: {
                id: courseId,
                isPublished: true,
            },
        });

        if (!course) {
            throw new Error("Course not found");
        }

        const purchase = await db.purchase.create({
            data: {
                userId,
                courseId,
                amount: 0,
                type: "FREE",
                status: "COMPLETED",
            },
        });

        if (session.user?.email) {
            await sendEnrollmentEmail(
                session.user.email,
                course.title,
                0,
                purchase.id
            );
        }

        await createNotification({
            userId,
            title: "Welcome to the Course!",
            message: `You have successfully enrolled in "${course.title}". Let's start learning!`,
            type: NotificationType.ENROLLMENT,
            href: `/courses/${courseId}`,
            metadata: { courseId }
        });

        revalidatePath(`/courses/${courseId}`);
        return purchase;
    } catch (error) {
        console.log("[ENROLL_COURSE]", error);
        return null;
    }
};

/**
 * Toggle topic completion status.
 */
export const toggleTopicCompletion = async (
    topicId: string,
    isCompleted: boolean
) => {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        if (!userId) {
            throw new Error("Unauthorized");
        }

        const userProgress = await db.userProgress.upsert({
            where: {
                userId_topicId: {
                    userId,
                    topicId,
                },
            },
            update: {
                isCompleted,
            },
            create: {
                userId,
                topicId,
                isCompleted,
            },
        });

        // Trigger certificate check if completed
        if (isCompleted) {
            const topic = await db.topic.findUnique({
                where: { id: topicId },
                include: { lesson: true }
            });

            if (topic?.lesson?.courseId) {
                await checkAndIssueCertificate(topic.lesson.courseId);
                revalidatePath(`/courses/${topic.lesson.courseId}`);
                revalidatePath(`/courses/${topic.lesson.courseId}/topics/${topicId}`);
            }
        }

        return userProgress;
    } catch (error) {
        console.log("[TOGGLE_COMPLETION]", error);
        return null;
    }
};
