"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export const getContacts = async () => {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            throw new Error("Unauthorized");
        }

        return await db.contact.findMany({
            orderBy: { createdAt: "desc" },
        });
    } catch (error) {
        console.log("[GET_CONTACTS]", error);
        return [];
    }
};

export const createContact = async (values: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    image?: string;
}) => {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            throw new Error("Unauthorized");
        }

        const contact = await db.contact.create({
            data: { ...values },
        });

        revalidatePath("/admin/contacts");
        return contact;
    } catch (error) {
        console.log("[CREATE_CONTACT]", error);
        return null;
    }
};

export const updateContact = async (id: string, values: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    isActive?: boolean;
}) => {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            throw new Error("Unauthorized");
        }

        const contact = await db.contact.update({
            where: { id },
            data: { ...values },
        });

        revalidatePath("/admin/contacts");
        return contact;
    } catch (error) {
        console.log("[UPDATE_CONTACT]", error);
        return null;
    }
};

export const deleteContact = async (id: string) => {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            throw new Error("Unauthorized");
        }

        await db.contact.delete({
            where: { id },
        });

        revalidatePath("/admin/contacts");
        return { success: true };
    } catch (error) {
        console.log("[DELETE_CONTACT]", error);
        return { success: false };
    }
};

export const toggleContactStatus = async (id: string) => {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            throw new Error("Unauthorized");
        }

        const contact = await db.contact.findUnique({ where: { id } });
        if (!contact) throw new Error("Contact not found");

        const updated = await db.contact.update({
            where: { id },
            data: { isActive: !contact.isActive },
        });

        revalidatePath("/admin/contacts");
        return updated;
    } catch (error) {
        console.log("[TOGGLE_CONTACT_STATUS]", error);
        return null;
    }
};
