"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export const getLearningPaths = async () => {
    try {
        console.log("[GET_LEARNING_PATHS] Fetching paths...");
        const paths = await db.learningPath.findMany({
            include: {
                category: true,
                _count: {
                    select: {
                        courses: true,
                        enrollments: true,
                    }
                }
            },
            orderBy: { createdAt: "desc" },
        });
        console.log(`[GET_LEARNING_PATHS] Found ${paths.length} paths`);
        return paths;
    } catch (error) {
        console.log("[GET_LEARNING_PATHS] Error:", error);
        return [];
    }
};

export const createLearningPath = async (data: { title: string; categoryId?: string }) => {
    try {
        const learningPath = await db.learningPath.create({
            data: {
                ...data,
            },
        });
        revalidatePath("/admin/learning-paths");
        return learningPath;
    } catch (error) {
        console.log("[CREATE_LEARNING_PATH]", error);
        // DEBUG: Expose available models in error
        const models = Object.keys(db).join(", ");
        throw new Error(`Failed to create learning path. Available models: ${models} | Error: ${error}`);
    }
};

export const updateLearningPath = async (id: string, data: any) => {
    try {
        const learningPath = await db.learningPath.update({
            where: { id },
            data: {
                ...data,
            },
        });
        revalidatePath("/admin/learning-paths");
        revalidatePath(`/admin/learning-paths/${id}`);
        return learningPath;
    } catch (error) {
        console.log("[UPDATE_LEARNING_PATH]", error);
        return null;
    }
};

export const deleteLearningPath = async (id: string) => {
    try {
        await db.learningPath.delete({
            where: { id },
        });
        revalidatePath("/admin/learning-paths");
        return { success: true };
    } catch (error) {
        console.log("[DELETE_LEARNING_PATH]", error);
        return { success: false };
    }
};

export const getLearningPathById = async (id: string) => {
    try {
        return await db.learningPath.findUnique({
            where: { id },
            include: {
                category: true,
                courses: {
                    include: {
                        course: {
                            include: {
                                category: true,
                            }
                        }
                    },
                    orderBy: { position: "asc" },
                },
                enrollments: {
                    include: {
                        user: true,
                    }
                },
                assignedGroups: {
                    include: {
                        group: true,
                    }
                },
                levelRules: true,
            },
        });
    } catch (error) {
        console.log("[GET_LEARNING_PATH_BY_ID]", error);
        return null;
    }
};

// Course Relations
export const addCourseToPath = async (pathId: string, courseId: string) => {
    try {
        const lastCourse = await db.learningPathCourse.findFirst({
            where: { learningPathId: pathId },
            orderBy: { position: "desc" },
        });

        const newPosition = lastCourse ? lastCourse.position + 1 : 0;

        await db.learningPathCourse.create({
            data: {
                learningPathId: pathId,
                courseId: courseId,
                position: newPosition,
            },
        });

        revalidatePath(`/admin/learning-paths/${pathId}`);
        return { success: true };
    } catch (error) {
        console.log("[ADD_COURSE_TO_PATH]", error);
        return { success: false };
    }
};

export const removeCourseFromPath = async (pathId: string, courseId: string) => {
    try {
        await db.learningPathCourse.delete({
            where: {
                learningPathId_courseId: {
                    learningPathId: pathId,
                    courseId: courseId,
                },
            },
        });

        revalidatePath(`/admin/learning-paths/${pathId}`);
        return { success: true };
    } catch (error) {
        console.log("[REMOVE_COURSE_FROM_PATH]", error);
        return { success: false };
    }
};

// User Relations
export const enrollUserInPath = async (pathId: string, userId: string) => {
    try {
        await db.learningPathUser.create({
            data: {
                learningPathId: pathId,
                userId: userId,
            },
        });
        revalidatePath(`/admin/learning-paths/${pathId}`);
        return { success: true };
    } catch (error) {
        console.log("[ENROLL_USER_IN_PATH]", error);
        return { success: false };
    }
};

export const unenrollUserFromPath = async (pathId: string, userId: string) => {
    try {
        await db.learningPathUser.delete({
            where: {
                learningPathId_userId: {
                    learningPathId: pathId,
                    userId: userId,
                },
            },
        });
        revalidatePath(`/admin/learning-paths/${pathId}`);
        return { success: true };
    } catch (error) {
        console.log("[UNENROLL_USER_FROM_PATH]", error);
        return { success: false };
    }
};

// Group Relations
export const getGroups = async () => {
    try {
        return await db.group.findMany();
    } catch (error) {
        console.log("[GET_GROUPS]", error);
        return [];
    }
};

export const assignGroupToPath = async (pathId: string, groupId: string) => {
    try {
        await db.learningPathGroup.create({
            data: {
                learningPathId: pathId,
                groupId: groupId,
            },
        });
        revalidatePath(`/admin/learning-paths/${pathId}`);
        return { success: true };
    } catch (error) {
        console.log("[ASSIGN_GROUP_TO_PATH]", error);
        return { success: false };
    }
};

export const unassignGroupFromPath = async (pathId: string, groupId: string) => {
    try {
        await db.learningPathGroup.delete({
            where: {
                learningPathId_groupId: {
                    learningPathId: pathId,
                    groupId: groupId,
                },
            },
        });
        revalidatePath(`/admin/learning-paths/${pathId}`);
        return { success: true };
    } catch (error) {
        console.log("[UNASSIGN_GROUP_FROM_PATH]", error);
        return { success: false };
    }
};

// Level Rules
export const updatePathLevelRules = async (pathId: string, data: any) => {
    try {
        await db.learningPathLevel.upsert({
            where: { learningPathId: pathId },
            update: data,
            create: {
                ...data,
                learningPathId: pathId,
            },
        });
        revalidatePath(`/admin/learning-paths/${pathId}`);
        return { success: true };
    } catch (error) {
        console.log("[UPDATE_PATH_LEVEL_RULES]", error);
        return { success: false };
    }
};
