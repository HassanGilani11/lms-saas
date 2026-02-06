"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { checkAndIssueCertificate } from "@/actions/certificate";

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
            },
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
            }
        }

        return userProgress;
    } catch (error) {
        console.log("[TOGGLE_COMPLETION]", error);
        return null;
    }
};
