"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// --- Groups ---

export const getGroups = async () => {
    try {
        const groups = await db.group.findMany({
            include: {
                category: true,
                tags: true,
                parent: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                leaders: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    }
                },
                _count: {
                    select: {
                        users: true,
                        learningPaths: true,
                        children: true,
                    }
                }
            },
            orderBy: { createdAt: "desc" },
        });
        return groups;
    } catch (error) {
        console.error("[GET_GROUPS]", error);
        return [];
    }
};

export const createGroup = async (values: {
    name: string;
    description?: string;
    categoryId?: string;
    tagIds?: string[];
    parentId?: string;
    leaderIds?: string[];
}) => {
    try {
        const group = await db.group.create({
            data: {
                name: values.name,
                description: values.description,
                categoryId: values.categoryId,
                parentId: values.parentId || null,
                tags: values.tagIds ? {
                    connect: values.tagIds.map((id) => ({ id })),
                } : undefined,
                leaders: values.leaderIds ? {
                    connect: values.leaderIds.map((id) => ({ id })),
                } : undefined,
            },
        });
        revalidatePath("/admin/groups");
        return group;
    } catch (error) {
        console.error("[CREATE_GROUP]", error);
        return null;
    }
};

export const updateGroup = async (id: string, values: {
    name?: string;
    description?: string;
    categoryId?: string;
    tagIds?: string[];
    parentId?: string | null;
    leaderIds?: string[];
}) => {
    try {
        const group = await db.group.update({
            where: { id },
            data: {
                name: values.name,
                description: values.description,
                categoryId: values.categoryId,
                parentId: values.parentId === undefined ? undefined : values.parentId,
                tags: values.tagIds ? {
                    set: values.tagIds.map((id) => ({ id })),
                } : undefined,
                leaders: values.leaderIds ? {
                    set: values.leaderIds.map((id) => ({ id })),
                } : undefined,
            },
        });
        revalidatePath("/admin/groups");
        revalidatePath(`/admin/groups/${id}`);
        return group;
    } catch (error) {
        console.error("[UPDATE_GROUP]", error);
        return null;
    }
};

export const getGroupById = async (id: string) => {
    try {
        const group = await db.group.findUnique({
            where: { id },
            include: {
                category: true,
                tags: true,
                parent: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                leaders: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        email: true,
                    }
                },
                users: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    }
                },
                children: {
                    include: {
                        _count: {
                            select: {
                                users: true,
                            }
                        }
                    }
                },
                assignedCourses: {
                    include: {
                        course: {
                            include: {
                                _count: {
                                    select: {
                                        lessons: true,
                                    }
                                }
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        users: true,
                        learningPaths: true,
                        children: true,
                        assignedCourses: true,
                    }
                }
            }
        });

        return group;
    } catch (error) {
        console.error("[GET_GROUP_BY_ID]", error);
        return null;
    }
};


export const deleteGroup = async (id: string) => {
    try {
        await db.group.delete({
            where: { id },
        });
        revalidatePath("/admin/groups");
        return true;
    } catch (error) {
        console.error("[DELETE_GROUP]", error);
        return false;
    }
};

// --- Hierarchy & Enrollments ---

export const getGroupHierarchy = async () => {
    try {
        const topLevelGroups = await db.group.findMany({
            where: { parentId: null },
            include: {
                children: {
                    include: {
                        children: true,
                    }
                }
            }
        });
        return topLevelGroups;
    } catch (error) {
        console.error("[GET_GROUP_HIERARCHY]", error);
        return [];
    }
};

export const enrollGroupInCourse = async (groupId: string, courseId: string) => {
    try {
        const enrollment = await db.courseGroup.create({
            data: {
                groupId,
                courseId,
            }
        });
        revalidatePath(`/admin/groups/${groupId}`);
        return enrollment;
    } catch (error) {
        console.error("[ENROLL_GROUP_IN_COURSE]", error);
        return null;
    }
};

export const unenrollGroupFromCourse = async (groupId: string, courseId: string) => {
    try {
        await db.courseGroup.delete({
            where: {
                courseId_groupId: {
                    courseId,
                    groupId,
                }
            }
        });
        revalidatePath(`/admin/groups/${groupId}`);
        return true;
    } catch (error) {
        console.error("[UNENROLL_GROUP_FROM_COURSE]", error);
        return false;
    }
};

export const addUsersToGroup = async (groupId: string, userIds: string[]) => {
    try {
        await db.group.update({
            where: { id: groupId },
            data: {
                users: {
                    connect: userIds.map(id => ({ id }))
                }
            }
        });
        revalidatePath(`/admin/groups/${groupId}`);
        return true;
    } catch (error) {
        console.error("[ADD_USERS_TO_GROUP]", error);
        return false;
    }
};

export const removeUserFromGroup = async (groupId: string, userId: string) => {
    try {
        await db.group.update({
            where: { id: groupId },
            data: {
                users: {
                    disconnect: { id: userId }
                }
            }
        });
        revalidatePath(`/admin/groups/${groupId}`);
        return true;
    } catch (error) {
        console.error("[REMOVE_USER_FROM_GROUP]", error);
        return false;
    }
};

export const bulkUserUpload = async (groupId: string, usersData: { email: string, name?: string }[]) => {
    try {
        for (const data of usersData) {
            // Find or create user
            let user = await db.user.findUnique({
                where: { email: data.email }
            });

            if (!user) {
                // For simplicity in this demo, we create a user with a default password/role
                // In a real app, you'd send an invite email
                user = await db.user.create({
                    data: {
                        email: data.email,
                        name: data.name || data.email.split('@')[0],
                        role: "STUDENT",
                    }
                });
            }

            // Add to group
            await db.group.update({
                where: { id: groupId },
                data: {
                    users: {
                        connect: { id: user.id }
                    }
                }
            });
        }
        revalidatePath(`/admin/groups/${groupId}`);
        return { success: true, count: usersData.length };
    } catch (error) {
        console.error("[BULK_USER_UPLOAD]", error);
        return { success: false, error: "Bulk upload failed" };
    }
};

export const getGroupCategories = async () => {
    try {
        return await db.groupCategory.findMany({
            include: {
                _count: {
                    select: { groups: true }
                }
            },
            orderBy: { name: "asc" }
        });
    } catch (error) {
        console.error("[GET_GROUP_CATEGORIES]", error);
        return [];
    }
};

export const createGroupCategory = async (values: { name: string; color?: string }) => {
    try {
        const category = await db.groupCategory.create({
            data: {
                name: values.name,
                color: values.color,
            },
        });
        revalidatePath("/admin/groups/categories");
        return category;
    } catch (error) {
        console.error("[CREATE_GROUP_CATEGORY]", error);
        return null;
    }
};

export const updateGroupCategory = async (id: string, values: { name: string; color?: string }) => {
    try {
        const category = await db.groupCategory.update({
            where: { id },
            data: {
                name: values.name,
                color: values.color,
            },
        });
        revalidatePath("/admin/groups/categories");
        return category;
    } catch (error) {
        console.error("[UPDATE_GROUP_CATEGORY]", error);
        return null;
    }
};

export const deleteGroupCategory = async (id: string) => {
    try {
        await db.groupCategory.delete({
            where: { id },
        });
        revalidatePath("/admin/groups/categories");
        return true;
    } catch (error) {
        console.error("[DELETE_GROUP_CATEGORY]", error);
        return false;
    }
};

// --- Tags ---

export const getGroupTags = async () => {
    try {
        return await db.groupTag.findMany({
            include: {
                _count: {
                    select: { groups: true }
                }
            },
            orderBy: { name: "asc" }
        });
    } catch (error) {
        console.error("[GET_GROUP_TAGS]", error);
        return [];
    }
};

export const createGroupTag = async (values: { name: string; color?: string }) => {
    try {
        const tag = await db.groupTag.create({
            data: {
                name: values.name,
                color: values.color,
            },
        });
        revalidatePath("/admin/groups/tags");
        return tag;
    } catch (error) {
        console.error("[CREATE_GROUP_TAG]", error);
        return null;
    }
};

export const updateGroupTag = async (id: string, values: { name: string; color?: string }) => {
    try {
        const tag = await db.groupTag.update({
            where: { id },
            data: {
                name: values.name,
                color: values.color,
            },
        });
        revalidatePath("/admin/groups/tags");
        return tag;
    } catch (error) {
        console.error("[UPDATE_GROUP_TAG]", error);
        return null;
    }
};

export const deleteGroupTag = async (id: string) => {
    try {
        await db.groupTag.delete({
            where: { id },
        });
        revalidatePath("/admin/groups/tags");
        return true;
    } catch (error) {
        console.error("[DELETE_GROUP_TAG]", error);
        return false;
    }
};
