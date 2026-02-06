"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export const createLesson = async (courseId: string, title: string) => {
    try {
        const session = await auth();
        const userId = session?.user?.id;
        const isAdmin = session?.user?.role === "ADMIN";

        if (!userId) {
            throw new Error("Unauthorized");
        }

        const courseOwner = await db.course.findUnique({
            where: {
                id: courseId,
                ...(isAdmin ? {} : { userId }),
            },
        });

        if (!courseOwner) {
            throw new Error("Unauthorized");
        }

        const lastLesson = await db.lesson.findFirst({
            where: {
                courseId,
            },
            orderBy: {
                position: "desc",
            },
        });

        const newPosition = lastLesson ? lastLesson.position + 1 : 1;

        const lesson = await db.lesson.create({
            data: {
                title,
                courseId,
                position: newPosition,
            },
        });

        revalidatePath(`/instructor/courses/${courseId}`);
        revalidatePath(`/admin/courses/${courseId}/edit`);

        return lesson;
    } catch (error) {
        console.log("[CREATE_LESSON]", error);
        return null;
    }
};

export const createTopic = async (
    lessonId: string,
    title: string,
    type: "VIDEO" | "TEXT" | "PDF" | "QUIZ"
) => {
    try {
        const session = await auth();
        const userId = session?.user?.id;
        const isAdmin = session?.user?.role === "ADMIN";

        if (!userId) {
            throw new Error("Unauthorized");
        }

        const lesson = await db.lesson.findUnique({
            where: {
                id: lessonId,
            },
            include: {
                course: true,
            },
        });

        if (!lesson || (lesson.course.userId !== userId && !isAdmin)) {
            throw new Error("Unauthorized");
        }

        const lastTopic = await db.topic.findFirst({
            where: {
                lessonId,
            },
            orderBy: {
                position: "desc",
            },
        });

        const newPosition = lastTopic ? lastTopic.position + 1 : 1;

        const topic = await db.topic.create({
            data: {
                title,
                lessonId,
                type,
                position: newPosition,
            },
        });

        // If type is QUIZ, create an empty Quiz and link it
        if (type === "QUIZ") {
            try {
                console.log("[CREATE_TOPIC] Creating type QUIZ for topic:", topic.id);
                const quiz = await db.quiz.create({
                    data: {
                        title: `${title} Quiz`,
                        courseId: lesson.courseId,
                        topicId: topic.id, // Linking back
                    }
                });
                console.log("[CREATE_TOPIC] Quiz created successfully:", quiz.id);

                await db.topic.update({
                    where: { id: topic.id },
                    data: { quizId: quiz.id }
                });

                // Return loaded relation for UI redirect
                return { ...topic, quizId: quiz.id };
            } catch (qError) {
                console.log("[CREATE_TOPIC] Failed to create quiz linked to topic:", qError);
                // Optionally delete the topic since it's invalid without the quiz? 
                // For now, just rethrow to trigger the outer catch
                throw qError;
            }
        }

        revalidatePath(`/instructor/courses/${lesson.course.id}`);
        revalidatePath(`/admin/courses/${lesson.course.id}/edit`);

        return topic;
    } catch (error) {
        console.log("[CREATE_TOPIC]", error);
        return null;
    }
};

export const updateLesson = async (lessonId: string, values: any) => {
    try {
        const session = await auth();
        const userId = session?.user?.id;
        const isAdmin = session?.user?.role === "ADMIN";

        if (!userId) {
            throw new Error("Unauthorized");
        }

        const lesson = await db.lesson.findUnique({
            where: {
                id: lessonId,
            },
            include: {
                course: true,
            },
        });

        if (!lesson || (lesson.course.userId !== userId && !isAdmin)) {
            throw new Error("Unauthorized");
        }

        const updatedLesson = await db.lesson.update({
            where: {
                id: lessonId,
            },
            data: {
                ...values,
            },
        });

        revalidatePath(`/instructor/courses/${lesson.courseId}`);
        return updatedLesson;
    } catch (error) {
        console.log("[UPDATE_LESSON]", error);
        return null;
    }
};

export const deleteLesson = async (lessonId: string) => {
    try {
        const session = await auth();
        const userId = session?.user?.id;
        const isAdmin = session?.user?.role === "ADMIN";

        if (!userId) {
            throw new Error("Unauthorized");
        }

        const lesson = await db.lesson.findUnique({
            where: {
                id: lessonId,
            },
            include: {
                course: true,
                topics: true,
            },
        });

        if (!lesson || (lesson.course.userId !== userId && !isAdmin)) {
            throw new Error("Unauthorized");
        }

        const deletedLesson = await db.lesson.delete({
            where: {
                id: lessonId,
            },
        });

        revalidatePath(`/instructor/courses/${lesson.courseId}`);
        return deletedLesson;
    } catch (error) {
        console.log("[DELETE_LESSON]", error);
        return null;
    }
};

export const updateTopic = async (topicId: string, values: any) => {
    try {
        const session = await auth();
        const userId = session?.user?.id;
        const isAdmin = session?.user?.role === "ADMIN";

        if (!userId) {
            throw new Error("Unauthorized");
        }

        const topic = await db.topic.findUnique({
            where: {
                id: topicId,
            },
            include: {
                lesson: {
                    include: {
                        course: true,
                    },
                },
            },
        });

        if (!topic || (topic.lesson.course.userId !== userId && !isAdmin)) {
            throw new Error("Unauthorized");
        }

        const updatedTopic = await db.topic.update({
            where: {
                id: topicId,
            },
            data: {
                ...values,
            },
        });

        revalidatePath(`/instructor/courses/${topic.lesson.courseId}`);
        return updatedTopic;
    } catch (error) {
        console.log("[UPDATE_TOPIC]", error);
        return null;
    }
};

export const deleteTopic = async (topicId: string) => {
    try {
        const session = await auth();
        const userId = session?.user?.id;
        const isAdmin = session?.user?.role === "ADMIN";

        if (!userId) {
            throw new Error("Unauthorized");
        }

        const topic = await db.topic.findUnique({
            where: {
                id: topicId,
            },
            include: {
                lesson: {
                    include: {
                        course: true,
                    },
                },
            },
        });

        if (!topic || (topic.lesson.course.userId !== userId && !isAdmin)) {
            throw new Error("Unauthorized");
        }

        const deletedTopic = await db.topic.delete({
            where: {
                id: topicId,
            },
        });

        revalidatePath(`/instructor/courses/${topic.lesson.courseId}`);
        return deletedTopic;
    } catch (error) {
        console.log("[DELETE_TOPIC]", error);
        return null;
    }
};

export const reorderTopics = async (lessonId: string, list: { id: string; position: number }[]) => {
    try {
        const session = await auth();
        const userId = session?.user?.id;
        const isAdmin = session?.user?.role === "ADMIN";

        if (!userId) {
            throw new Error("Unauthorized");
        }

        const lesson = await db.lesson.findUnique({
            where: {
                id: lessonId,
            },
            include: {
                course: true,
            },
        });

        if (!lesson || (lesson.course.userId !== userId && !isAdmin)) {
            throw new Error("Unauthorized");
        }

        for (let item of list) {
            await db.topic.update({
                where: { id: item.id },
                data: { position: item.position },
            });
        }

        revalidatePath(`/instructor/courses/${lesson.courseId}`);
        return { success: true };
    } catch (error) {
        console.log("[REORDER_TOPICS]", error);
        return null;
    }
};

