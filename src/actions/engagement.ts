"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { createNotification } from "@/actions/notifications";
import { NotificationType } from "@/lib/prisma";

/**
 * Post a new discussion thread in a lesson.
 * Includes basic rate limiting (1 post per 5 seconds).
 */
export const postDiscussion = async (topicId: string, title: string, content: string) => {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        if (!userId) throw new Error("Unauthorized");

        // Rate limiting check
        const lastDiscussion = await db.discussion.findFirst({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });

        if (lastDiscussion && (new Date().getTime() - lastDiscussion.createdAt.getTime() < 5000)) {
            throw new Error("Please wait before posting again.");
        }

        const discussion = await db.discussion.create({
            data: {
                topicId,
                userId,
                title,
                content,
            },
            include: {
                topic: {
                    include: {
                        lesson: {
                            include: {
                                course: true
                            }
                        }
                    }
                }
            }
        });

        // Notify instructor
        if (discussion.topic?.lesson?.course?.userId) {
            await createNotification({
                userId: discussion.topic.lesson.course.userId,
                title: "New Discussion Posted",
                message: `A student started a new discussion: "${title}" in "${discussion.topic.lesson.course.title}".`,
                type: NotificationType.DISCUSSION,
                href: `/instructor/courses/${discussion.topic.lesson.courseId}`,
                metadata: { discussionId: discussion.id }
            });
        }

        revalidatePath(`/courses/[courseId]/lessons/[lessonId]`);
        return discussion;
    } catch (error) {
        console.log("[POST_DISCUSSION]", error);
        return null;
    }
};

/**
 * Report content for moderation.
 */
export const reportContent = async (data: {
    discussionId?: string;
    commentId?: string;
    reason: string
}) => {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        if (!userId) throw new Error("Unauthorized");

        const report = await db.report.create({
            data: {
                userId,
                ...data,
            }
        });

        return report;
    } catch (error) {
        console.log("[REPORT_CONTENT]", error);
        return null;
    }
};

/**
 * Get notifications for the current user.
 */
export const getUserNotifications = async () => {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        if (!userId) throw new Error("Unauthorized");

        return await db.notification.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: 20,
        });
    } catch (error) {
        console.log("[GET_NOTIFICATIONS]", error);
        return [];
    }
};

/**
 * Moderate content (Admin/Instructor).
 */
export const moderateAction = async (reportId: string, action: "RESOLVED" | "DISMISSED") => {
    try {
        const session = await auth();
        if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "INSTRUCTOR")) {
            throw new Error("Unauthorized");
        }

        const report = await db.report.update({
            where: { id: reportId },
            data: { status: action },
            include: {
                discussion: true,
                comment: true,
            }
        });

        // If resolved and abusive, we might want to delete the content
        if (action === "RESOLVED") {
            if (report.discussionId) {
                await db.discussion.delete({ where: { id: report.discussionId } });
            } else if (report.commentId) {
                await db.comment.delete({ where: { id: report.commentId } });
            }
        }

        return report;
    } catch (error) {
        console.log("[MODERATE_ACTION]", error);
        return null;
    }
};

export const updateDiscussion = async (discussionId: string, values: any) => {
    try {
        const session = await auth();
        const userId = session?.user?.id;
        if (!userId) throw new Error("Unauthorized");

        return await db.discussion.update({
            where: { id: discussionId, userId },
            data: { ...values }
        });
    } catch (error) {
        console.log("[UPDATE_DISCUSSION]", error);
        return null;
    }
};

export const deleteDiscussion = async (discussionId: string) => {
    try {
        const session = await auth();
        const userId = session?.user?.id;
        if (!userId) throw new Error("Unauthorized");

        return await db.discussion.delete({
            where: { id: discussionId, userId }
        });
    } catch (error) {
        console.log("[DELETE_DISCUSSION]", error);
        return null;
    }
};

export const createComment = async (discussionId: string, content: string, parentId?: string) => {
    try {
        const session = await auth();
        const userId = session?.user?.id;
        if (!userId) throw new Error("Unauthorized");

        const comment = await db.comment.create({
            data: {
                discussionId,
                userId,
                content,
                parentId
            },
            include: {
                discussion: true,
            }
        });

        // Notify discussion owner if they are not the one commenting
        if (comment.discussion?.userId && comment.discussion.userId !== userId) {
            await createNotification({
                userId: comment.discussion.userId,
                title: "New Reply on Your Discussion",
                message: `Someone replied to your discussion: "${comment.discussion.title}".`,
                type: NotificationType.DISCUSSION,
                href: `/courses/[courseId]/lessons/[lessonId]`, // Dynamic in FE
                metadata: { discussionId, commentId: comment.id }
            });
        }

        return comment;
    } catch (error) {
        console.log("[CREATE_COMMENT]", error);
        return null;
    }
};

export const updateComment = async (commentId: string, content: string) => {
    try {
        const session = await auth();
        const userId = session?.user?.id;
        if (!userId) throw new Error("Unauthorized");

        return await db.comment.update({
            where: { id: commentId, userId },
            data: { content }
        });
    } catch (error) {
        console.log("[UPDATE_COMMENT]", error);
        return null;
    }
};

export const deleteComment = async (commentId: string) => {
    try {
        const session = await auth();
        const userId = session?.user?.id;
        if (!userId) throw new Error("Unauthorized");

        return await db.comment.delete({
            where: { id: commentId, userId }
        });
    } catch (error) {
        console.log("[DELETE_COMMENT]", error);
        return null;
    }
};

export const markNotificationRead = async (notificationId: string) => {
    try {
        const session = await auth();
        const userId = session?.user?.id;
        if (!userId) throw new Error("Unauthorized");

        return await db.notification.update({
            where: { id: notificationId, userId },
            data: { isRead: true }
        });
    } catch (error) {
        console.log("[MARK_NOTIFICATION_READ]", error);
        return null;
    }
};
