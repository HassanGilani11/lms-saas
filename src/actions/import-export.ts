"use server";

// Note: This file contains server actions, but they must be exported correctly.
// I'll use "use server" at the top of the actual file.

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export const exportData = async (selection: { type: string; entities: Record<string, string[]> }) => {
    try {
        const session = await auth();
        if (session?.user?.role !== "ADMIN") {
            throw new Error("Unauthorized");
        }

        const data: any = {
            timestamp: new Date().toISOString(),
            version: "1.0",
            exportedBy: session.user.id,
        };

        const isAll = selection.type === "everything";
        const selected = selection.entities;

        // Export Users
        if (isAll || selected.user?.includes("Profiles") || selected.user?.includes("Progress")) {
            data.users = await db.user.findMany({
                include: {
                    notificationPreferences: true,
                    purchases: true,
                    quizAttempts: true,
                    userAchievements: true
                }
            });
        }

        // Export Curriculum (Courses, Lessons, Topics, Quizzes, Questions)
        const curriculumSelected = isAll ||
            selected.course?.includes("Posts") ||
            selected.lesson?.includes("Posts") ||
            selected.topic?.includes("Posts") ||
            selected.quiz?.includes("Posts") ||
            selected.question?.includes("Posts");

        if (curriculumSelected) {
            data.courses = await db.course.findMany({
                include: {
                    lessons: {
                        include: {
                            topics: {
                                include: {
                                    quiz: {
                                        include: {
                                            questions: {
                                                include: {
                                                    options: true
                                                }
                                            }
                                        }
                                    },
                                    attachments: true
                                }
                            }
                        }
                    },
                    attachments: true,
                    category: true,
                    tags: true
                }
            });
        }

        // Export All Categories
        if (isAll || selected.other?.includes("Global Settings") || selected.course?.includes("Settings")) {
            data.categories = await db.category.findMany();
            data.groupCategories = await db.groupCategory.findMany();
        }

        // Export Groups
        if (isAll || selected.group?.includes("Posts") || selected.group?.includes("Settings")) {
            data.groups = await db.group.findMany({
                include: {
                    category: true,
                    tags: true,
                    leaders: {
                        select: { id: true, name: true, email: true }
                    }
                }
            });
        }

        // Export Purchases
        if (isAll || selected.order?.includes("Posts")) {
            data.purchases = await db.purchase.findMany({
                include: {
                    course: { select: { id: true, title: true } },
                    user: { select: { id: true, name: true, email: true } }
                }
            });
        }

        // Export Certificates
        if (isAll || selected.certificate?.includes("Posts") || selected.certificate?.includes("Settings")) {
            data.certificates = await db.certificate.findMany({
                include: {
                    course: { select: { id: true, title: true } },
                    user: { select: { id: true, name: true, email: true } }
                }
            });
        }

        return { success: true, data: JSON.stringify(data, null, 2) };
    } catch (error) {
        console.error("[EXPORT_DATA]", error);
        return { success: false, error: "Failed to export data" };
    }
};

export const importData = async (jsonData: string) => {
    try {
        const session = await auth();
        if (session?.user?.role !== "ADMIN") {
            throw new Error("Unauthorized");
        }

        const data = JSON.parse(jsonData);

        // Basic validation
        if (!data.version || !data.timestamp) {
            throw new Error("Invalid format");
        }

        // Import Logic (Sequential to handle relations)

        // 1. Categories
        if (data.categories) {
            for (const cat of data.categories) {
                await db.category.upsert({
                    where: { id: cat.id },
                    update: { name: cat.name },
                    create: { id: cat.id, name: cat.name }
                });
            }
        }

        // 2. Users (Simple profile sync)
        if (data.users) {
            for (const user of data.users) {
                await db.user.upsert({
                    where: { id: user.id },
                    update: {
                        name: user.name,
                        username: user.username,
                        image: user.image,
                        role: user.role,
                    },
                    create: {
                        id: user.id,
                        name: user.name,
                        username: user.username,
                        email: user.email,
                        image: user.image,
                        role: user.role,
                    }
                });
            }
        }

        // 3. Courses, Lessons, Topics, Quizzes
        // This requires multi-level upserts or a clean wipe-and-recreate strategy.
        // For now, we'll do a simple loop for Courses.
        if (data.courses) {
            for (const course of data.courses) {
                await db.course.upsert({
                    where: { id: course.id },
                    update: {
                        title: course.title,
                        description: course.description,
                        isPublished: course.isPublished,
                        price: course.price,
                        categoryId: course.categoryId,
                    },
                    create: {
                        id: course.id,
                        userId: course.userId,
                        title: course.title,
                        description: course.description,
                        isPublished: course.isPublished,
                        price: course.price,
                        categoryId: course.categoryId,
                    }
                });
            }
        }

        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("[IMPORT_DATA]", error);
        return { success: false, error: "Failed to import data" };
    }
};
