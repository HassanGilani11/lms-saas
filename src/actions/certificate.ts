"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { nanoid } from "nanoid";
import { checkAchievements } from "./achievement";

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

        // 1. Fetch all published topics in the course
        const publishedTopics = await db.topic.findMany({
            where: {
                lesson: {
                    courseId: courseId,
                },
                isPublished: true,
            },
            select: {
                id: true,
            },
        });

        const topicIds = publishedTopics.map((topic) => topic.id);

        if (topicIds.length === 0) return null;

        // 2. Count completed topics for the user
        const completedTopicsCount = await db.userProgress.count({
            where: {
                userId: userId,
                topicId: {
                    in: topicIds,
                },
                isCompleted: true,
            },
        });

        const isCompleted = completedTopicsCount === topicIds.length;

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
                metadata: {
                    courseTitle: (await db.course.findUnique({ where: { id: courseId }, select: { title: true } }))?.title,
                    userName: session.user.name,
                    issuedAt: new Date().toISOString(),
                }
            },
        });

        // Check for achievements
        await checkAchievements(userId, { type: 'course_completion', courseId });

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
