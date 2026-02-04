"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export const getCourseTags = async () => {
    try {
        return await db.courseTag.findMany({
            include: {
                _count: {
                    select: { courses: true }
                }
            },
            orderBy: { name: "asc" }
        });
    } catch (error) {
        console.error("[GET_COURSE_TAGS]", error);
        return [];
    }
};

export const createCourseTag = async (values: { name: string; color?: string }) => {
    try {
        const tag = await db.courseTag.create({
            data: {
                name: values.name,
                color: values.color,
            },
        });
        revalidatePath("/admin/courses/tags");
        return tag;
    } catch (error) {
        console.error("[CREATE_COURSE_TAG]", error);
        return null;
    }
};

export const updateCourseTag = async (id: string, values: { name: string; color?: string }) => {
    try {
        const tag = await db.courseTag.update({
            where: { id },
            data: {
                name: values.name,
                color: values.color,
            },
        });
        revalidatePath("/admin/courses/tags");
        return tag;
    } catch (error) {
        console.error("[UPDATE_COURSE_TAG]", error);
        return null;
    }
};

export const deleteCourseTag = async (id: string) => {
    try {
        await db.courseTag.delete({
            where: { id },
        });
        revalidatePath("/admin/courses/tags");
        return true;
    } catch (error) {
        console.error("[DELETE_COURSE_TAG]", error);
        return false;
    }
};
