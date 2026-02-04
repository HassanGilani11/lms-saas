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
                _count: {
                    select: {
                        users: true,
                        learningPaths: true,
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

export const createGroup = async (values: { name: string; description?: string; categoryId?: string; tagIds?: string[] }) => {
    try {
        const group = await db.group.create({
            data: {
                name: values.name,
                description: values.description,
                categoryId: values.categoryId,
                tags: values.tagIds ? {
                    connect: values.tagIds.map((id) => ({ id })),
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

export const updateGroup = async (id: string, values: { name?: string; description?: string; categoryId?: string; tagIds?: string[] }) => {
    try {
        const group = await db.group.update({
            where: { id },
            data: {
                name: values.name,
                description: values.description,
                categoryId: values.categoryId,
                tags: values.tagIds ? {
                    set: values.tagIds.map((id) => ({ id })),
                } : undefined,
            },
        });
        revalidatePath("/admin/groups");
        return group;
    } catch (error) {
        console.error("[UPDATE_GROUP]", error);
        return null;
    }
};

export const getGroupById = async (id: string) => {
    try {
        return await db.group.findUnique({
            where: { id },
            include: {
                category: true,
                tags: true,
                _count: {
                    select: {
                        users: true,
                        learningPaths: true,
                    }
                }
            }
        });
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

// --- Categories ---

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
