"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

export const getAdminCourses = async () => {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            throw new Error("Unauthorized");
        }

        return await db.course.findMany({
            orderBy: {
                createdAt: "desc",
            },
            include: {
                user: {
                    select: {
                        name: true,
                    },
                },
                category: true,
                _count: {
                    select: {
                        modules: true,
                    },
                },
            },
        });
    } catch (error) {
        console.log("[GET_ADMIN_COURSES]", error);
        return [];
    }
};

export const getQuizData = async (quizId: string) => {
    try {
        const session = await auth();
        if (!session?.user) throw new Error("Unauthorized");

        return await db.quiz.findUnique({
            where: { id: quizId },
            include: {
                questions: {
                    orderBy: { position: "asc" },
                    include: {
                        options: {
                            orderBy: { position: "asc" },
                        },
                    },
                },
            },
        });
    } catch (error) {
        console.log("[GET_QUIZ_DATA]", error);
        return null;
    }
};

export const getAdminCertificates = async () => {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            throw new Error("Unauthorized");
        }

        return await db.certificate.findMany({
            orderBy: { issuedAt: "desc" },
            include: {
                user: { select: { name: true, email: true } },
                course: { select: { title: true } },
            },
        });
    } catch (error) {
        console.log("[GET_ADMIN_CERTIFICATES]", error);
        return [];
    }
};

export const resolveReport = async (reportId: string) => {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            throw new Error("Unauthorized");
        }

        return await db.report.update({
            where: { id: reportId },
            data: { status: "RESOLVED" },
        });
    } catch (error) {
        console.log("[RESOLVE_REPORT]", error);
        return null;
    }
};

export const dismissReport = async (reportId: string) => {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            throw new Error("Unauthorized");
        }

        return await db.report.update({
            where: { id: reportId },
            data: { status: "DISMISSED" },
        });
    } catch (error) {
        console.log("[DISMISS_REPORT]", error);
        return null;
    }
};

export const getAdminReports = async () => {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            throw new Error("Unauthorized");
        }

        return await db.report.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                user: { select: { name: true, email: true } },
                discussion: true,
                comment: true,
            },
        });
    } catch (error) {
        console.log("[GET_ADMIN_REPORTS]", error);
        return [];
    }
};
export const getCategories = async () => {
    try {
        return await db.category.findMany({
            orderBy: {
                name: "asc",
            },
            include: {
                _count: {
                    select: { courses: true }
                }
            }
        });
    } catch (error) {
        console.log("[GET_CATEGORIES]", error);
        return [];
    }
};
