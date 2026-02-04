"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export const createModule = async (courseId: string, title: string) => {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        if (!userId) {
            throw new Error("Unauthorized");
        }

        const courseOwner = await db.course.findUnique({
            where: {
                id: courseId,
                userId,
            },
        });

        if (!courseOwner) {
            throw new Error("Unauthorized");
        }

        const lastModule = await db.module.findFirst({
            where: {
                courseId,
            },
            orderBy: {
                position: "desc",
            },
        });

        const newPosition = lastModule ? lastModule.position + 1 : 1;

        const module = await db.module.create({
            data: {
                title,
                courseId,
                position: newPosition,
            },
        });

        return module;
    } catch (error) {
        console.log("[CREATE_MODULE]", error);
        return null;
    }
};

export const createLesson = async (
    moduleId: string,
    title: string,
    type: "VIDEO" | "TEXT" | "PDF"
) => {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        if (!userId) {
            throw new Error("Unauthorized");
        }

        const module = await db.module.findUnique({
            where: {
                id: moduleId,
            },
            include: {
                course: true,
            },
        });

        if (!module || module.course.userId !== userId) {
            throw new Error("Unauthorized");
        }

        const lastLesson = await db.lesson.findFirst({
            where: {
                moduleId,
            },
            orderBy: {
                position: "desc",
            },
        });

        const newPosition = lastLesson ? lastLesson.position + 1 : 1;

        const lesson = await db.lesson.create({
            data: {
                title,
                moduleId,
                type,
                position: newPosition,
            },
        });

        return lesson;
    } catch (error) {
        console.log("[CREATE_LESSON]", error);
        return null;
    }
};

export const updateModule = async (moduleId: string, values: any) => {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        if (!userId) {
            throw new Error("Unauthorized");
        }

        const module = await db.module.findUnique({
            where: {
                id: moduleId,
            },
            include: {
                course: true,
            },
        });

        if (!module || module.course.userId !== userId) {
            throw new Error("Unauthorized");
        }

        const updatedModule = await db.module.update({
            where: {
                id: moduleId,
            },
            data: {
                ...values,
            },
        });

        revalidatePath(`/instructor/courses/${module.courseId}`);
        return updatedModule;
    } catch (error) {
        console.log("[UPDATE_MODULE]", error);
        return null;
    }
};

export const deleteModule = async (moduleId: string) => {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        if (!userId) {
            throw new Error("Unauthorized");
        }

        const module = await db.module.findUnique({
            where: {
                id: moduleId,
            },
            include: {
                course: true,
                lessons: true,
            },
        });

        if (!module || module.course.userId !== userId) {
            throw new Error("Unauthorized");
        }

        // Potential cleanup for lessons (cascade delete is on in schema, but good to be aware)
        const deletedModule = await db.module.delete({
            where: {
                id: moduleId,
            },
        });

        revalidatePath(`/instructor/courses/${module.courseId}`);
        return deletedModule;
    } catch (error) {
        console.log("[DELETE_MODULE]", error);
        return null;
    }
};

export const updateLesson = async (lessonId: string, values: any) => {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        if (!userId) {
            throw new Error("Unauthorized");
        }

        const lesson = await db.lesson.findUnique({
            where: {
                id: lessonId,
            },
            include: {
                module: {
                    include: {
                        course: true,
                    },
                },
            },
        });

        if (!lesson || lesson.module.course.userId !== userId) {
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

        revalidatePath(`/instructor/courses/${lesson.module.courseId}`);
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

        if (!userId) {
            throw new Error("Unauthorized");
        }

        const lesson = await db.lesson.findUnique({
            where: {
                id: lessonId,
            },
            include: {
                module: {
                    include: {
                        course: true,
                    },
                },
            },
        });

        if (!lesson || lesson.module.course.userId !== userId) {
            throw new Error("Unauthorized");
        }

        const deletedLesson = await db.lesson.delete({
            where: {
                id: lessonId,
            },
        });

        revalidatePath(`/instructor/courses/${lesson.module.courseId}`);
        return deletedLesson;
    } catch (error) {
        console.log("[DELETE_LESSON]", error);
        return null;
    }
};

export const reorderLessons = async (moduleId: string, list: { id: string; position: number }[]) => {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        if (!userId) {
            throw new Error("Unauthorized");
        }

        const module = await db.module.findUnique({
            where: {
                id: moduleId,
            },
            include: {
                course: true,
            },
        });

        if (!module || module.course.userId !== userId) {
            throw new Error("Unauthorized");
        }

        for (let item of list) {
            await db.lesson.update({
                where: { id: item.id },
                data: { position: item.position },
            });
        }

        revalidatePath(`/instructor/courses/${module.courseId}`);
        return { success: true };
    } catch (error) {
        console.log("[REORDER_LESSONS]", error);
        return null;
    }
};
