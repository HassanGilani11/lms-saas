"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { nanoid } from "nanoid";

/**
 * Check if a course is completed by a user and issue a certificate if so.
 */
export const checkAndIssueCertificate = async (courseId: string) => {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        if (!userId) {
            throw new Error("Unauthorized");
        }

        // 1. Fetch all published lessons in the course
        const publishedLessons = await db.lesson.findMany({
            where: {
                module: {
                    courseId: courseId,
                },
                isPublished: true,
            },
            select: {
                id: true,
            },
        });

        const lessonIds = publishedLessons.map((lesson: { id: string }) => lesson.id);

        if (lessonIds.length === 0) return null;

        // 2. Count completed lessons for the user
        const completedLessonsCount = await db.userProgress.count({
            where: {
                userId: userId,
                lessonId: {
                    in: lessonIds,
                },
                isCompleted: true,
            },
        });

        const isCompleted = completedLessonsCount === lessonIds.length;

        if (!isCompleted) return null;

        // 3. Check if certificate already exists
        const existingCertificate = await db.certificate.findFirst({
            where: {
                userId,
                courseId,
            },
        });

        if (existingCertificate) return existingCertificate;

        // 4. Generate unique verification code
        // Format: LUMINA-XXXX-XXXX
        const code = `LUMINA-${nanoid(4).toUpperCase()}-${nanoid(4).toUpperCase()}`;

        // 5. Create certificate
        const certificate = await db.certificate.create({
            data: {
                userId,
                courseId,
                certificateCode: code,
            },
        });

        return certificate;
    } catch (error) {
        console.log("[CHECK_ISSUE_CERTIFICATE]", error);
        return null;
    }
};

/**
 * Verify a certificate by its unique code.
 */
export const verifyCertificate = async (code: string) => {
    try {
        const certificate = await db.certificate.findUnique({
            where: {
                certificateCode: code,
            },
            include: {
                user: {
                    select: {
                        name: true,
                    },
                },
                course: {
                    select: {
                        title: true,
                    },
                },
            },
        });

        return certificate;
    } catch (error) {
        console.log("[VERIFY_CERTIFICATE]", error);
        return null;
    }
};

/**
 * Delete a certificate.
 */
export const deleteCertificate = async (id: string) => {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            throw new Error("Unauthorized");
        }

        return await db.certificate.delete({
            where: { id },
        });
    } catch (error) {
        console.log("[DELETE_CERTIFICATE]", error);
        return null;
    }
};

/**
 * Manually issue a certificate to a user for a course.
 */
export const issueManualCertificate = async (userId: string, courseId: string) => {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            throw new Error("Unauthorized");
        }

        const existingCertificate = await db.certificate.findFirst({
            where: { userId, courseId },
        });

        if (existingCertificate) return existingCertificate;

        const code = `MANUAL-${nanoid(4).toUpperCase()}-${nanoid(4).toUpperCase()}`;

        return await db.certificate.create({
            data: {
                userId,
                courseId,
                certificateCode: code,
            },
        });
    } catch (error) {
        console.log("[ISSUE_MANUAL_CERTIFICATE]", error);
        return null;
    }
};
