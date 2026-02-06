"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

export const getAdminLessons = async () => {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== "ADMIN") {
            throw new Error("Unauthorized");
        }

        const lessons = await db.lesson.findMany({
            orderBy: {
                createdAt: "desc",
            },
            include: {
                course: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
                _count: {
                    select: {
                        topics: true,
                    },
                },
            },
        });

        return lessons;
    } catch (error) {
        console.log("[GET_ADMIN_LESSONS]", error);
        return [];
    }
};

export const getAdminTopics = async () => {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== "ADMIN") {
            throw new Error("Unauthorized");
        }

        const topics = await db.topic.findMany({
            where: {
                type: {
                    not: "QUIZ"
                }
            },
            orderBy: {
                createdAt: "desc",
            },
            include: {
                lesson: {
                    select: {
                        title: true,
                        course: {
                            select: {
                                id: true,
                                title: true,
                            },
                        },
                    },
                },
            },
        });

        return topics;
    } catch (error) {
        console.log("[GET_ADMIN_TOPICS]", error);
        return [];
    }
};

export const getLesson = async (lessonId: string) => {
    try {
        const session = await auth();
        if (!session?.user) throw new Error("Unauthorized");

        return await db.lesson.findUnique({
            where: { id: lessonId },
            include: {
                topics: {
                    orderBy: { position: "asc" }
                }
            }
        });
    } catch (error) {
        console.log("[GET_LESSON]", error);
        return null;
    }
};

export const getTopic = async (topicId: string) => {
    try {
        const session = await auth();
        if (!session?.user) throw new Error("Unauthorized");

        return await db.topic.findUnique({
            where: { id: topicId },
            include: {
                lesson: {
                    select: {
                        courseId: true,
                        title: true
                    }
                }
            }
        });
    } catch (error) {
        console.log("[GET_TOPIC]", error);
        return null;
    }
};
