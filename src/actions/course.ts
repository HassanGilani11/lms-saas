"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export const createCourse = async (title: string, values?: { price?: number; userId?: string; categoryId?: string; courseCode?: string; tagIds?: string[] }) => {
    try {
        const session = await auth();
        const isAdmin = session?.user?.role === "ADMIN";
        let targetUserId = session?.user?.id;

        if (!targetUserId || (session?.user?.role !== "INSTRUCTOR" && !isAdmin)) {
            throw new Error("Unauthorized");
        }

        // If admin provides a specific instructor, use that
        if (isAdmin && values?.userId) {
            targetUserId = values.userId;
        }

        const course = await db.course.create({
            data: {
                userId: targetUserId,
                title,
                price: values?.price || 0,
                categoryId: values?.categoryId,
                // @ts-ignore
                courseCode: values?.courseCode,
                tags: values?.tagIds ? {
                    connect: values.tagIds.map((id: string) => ({ id })),
                } : undefined,
            },
        });

        revalidatePath("/admin/courses");
        return course;
    } catch (error) {
        console.log("[CREATE_COURSE]", error);
        return null;
    }
};

export const updateCourse = async (courseId: string, values: any) => {
    try {
        const session = await auth();
        const userId = session?.user?.id;
        const isAdmin = session?.user?.role === "ADMIN";

        if (!userId) {
            throw new Error("Unauthorized");
        }

        // Cache breaker: v2
        const course = await db.course.update({
            where: {
                id: courseId,
                ...(isAdmin ? {} : { userId }),
            },
            data: {
                title: values.title,
                // @ts-ignore
                courseCode: values.courseCode,
                categoryId: values.categoryId,
                description: values.description,
                introVideoUrl: values.introVideoUrl,
                level: values.level,
                isActive: values.isActive,
                isPublished: values.isActive,
                hideFromCatalog: values.hideFromCatalog,
                price: values.price ? parseFloat(values.price.toString()) : 0,
                capacity: values.capacity ? parseInt(values.capacity.toString()) : 0,
                tags: values.tagIds ? {
                    set: values.tagIds.map((id: string) => ({ id })),
                } : undefined,
            },
        });

        revalidatePath(`/instructor/courses/${courseId}`);
        revalidatePath(`/admin/courses/${courseId}/edit`);
        revalidatePath(`/admin/courses/${courseId}/detail`);
        revalidatePath("/admin/courses");
        return course;
    } catch (error) {
        console.log("[UPDATE_COURSE]", error);
        return null;
    }
};

export const getCourseById = async (courseId: string) => {
    try {
        const course = await db.course.findUnique({
            where: { id: courseId },
            include: {
                category: true,
                tags: true,
                user: {
                    select: {
                        name: true,
                        email: true,
                    }
                },
                modules: {
                    orderBy: { position: "asc" },
                },
                _count: {
                    select: {
                        modules: true,
                    }
                }
            }
        });
        return course;
    } catch (error) {
        console.log("[GET_COURSE_BY_ID]", error);
        return null;
    }
};

export const publishCourse = async (courseId: string) => {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        if (!userId) {
            throw new Error("Unauthorized");
        }

        const course = await db.course.findUnique({
            where: {
                id: courseId,
                userId,
            },
            include: {
                modules: {
                    include: {
                        lessons: true,
                    },
                },
            },
        });

        if (!course) {
            throw new Error("Not found");
        }

        const hasPublishedLesson = course.modules.some((module) =>
            module.lessons.some((lesson) => lesson.isPublished)
        );

        if (!course.title || !course.description || !hasPublishedLesson) {
            throw new Error("Missing required fields");
        }

        const publishedCourse = await db.course.update({
            where: {
                id: courseId,
                userId,
            },
            data: {
                isPublished: true,
            },
        });

        return publishedCourse;
    } catch (error) {
        console.log("[PUBLISH_COURSE]", error);
        return null;
    }
};

export const deleteCourse = async (courseId: string) => {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        if (!userId) {
            throw new Error("Unauthorized");
        }

        const course = await db.course.findUnique({
            where: {
                id: courseId,
                userId,
            },
        });

        if (!course) {
            throw new Error("Not found");
        }

        const deletedCourse = await db.course.delete({
            where: {
                id: courseId,
            },
        });

        revalidatePath("/instructor/courses");
        return deletedCourse;
    } catch (error) {
        console.log("[DELETE_COURSE]", error);
        return null;
    }
};

export const reorderModules = async (courseId: string, list: { id: string; position: number }[]) => {
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

        for (let item of list) {
            await db.module.update({
                where: { id: item.id },
                data: { position: item.position },
            });
        }

        revalidatePath(`/instructor/courses/${courseId}`);
        return { success: true };
    } catch (error) {
        console.log("[REORDER_MODULES]", error);
        return null;
    }
};

export const adminDeleteCourse = async (courseId: string) => {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            throw new Error("Unauthorized");
        }

        const deletedCourse = await db.course.delete({
            where: {
                id: courseId,
            },
        });

        revalidatePath("/admin/courses");
        return deletedCourse;
    } catch (error) {
        console.log("[ADMIN_DELETE_COURSE]", error);
        return null;
    }
};
