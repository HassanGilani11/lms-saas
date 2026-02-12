"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { createNotification } from "@/actions/notifications";
import { NotificationType } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendEnrollmentEmail } from "@/lib/mail";

/**
 * Handle Cash on Delivery (COD) enrollment.
 * Creates a Purchase record with PENDING status.
 */
export const enrollWithCod = async (courseId: string, guestDetails?: { email: string; name: string }) => {
    try {
        console.log("[ENROLL_COD] Starting enrollment for course:", courseId);
        const session = await auth();
        let userId = session?.user?.id;
        const isAdmin = session?.user?.role === "ADMIN";

        let generatedPassword = "";

        // Handle Guest User Creation
        if (!userId && guestDetails) {
            const { email, name } = guestDetails;

            // Check if user exists
            const existingUser = await db.user.findUnique({
                where: { email }
            });

            if (existingUser) {
                userId = existingUser.id;
            } else {
                generatedPassword = Math.random().toString(36).slice(-10);
                const hashedPassword = await bcrypt.hash(generatedPassword, 10);

                // Create new user
                const newUser = await db.user.create({
                    data: {
                        email,
                        name,
                        password: hashedPassword,
                        role: "STUDENT",
                    }
                });
                userId = newUser.id;
            }
        }

        if (!userId) {
            throw new Error("Unauthorized");
        }

        const course = await db.course.findUnique({
            where: {
                id: courseId,
                ...(isAdmin ? {} : { isPublished: true }),
            },
        });

        if (!course) {
            throw new Error("Course not found");
        }

        const existingPurchase = await db.purchase.findUnique({
            where: {
                userId_courseId: {
                    userId,
                    courseId,
                }
            }
        });

        if (existingPurchase) {
            if (existingPurchase.status === "PENDING") {
                throw new Error("Your enrollment is already pending approval");
            }
            throw new Error("You are already enrolled in this course");
        }

        const purchase = await db.purchase.create({
            data: {
                userId,
                courseId,
                status: "PENDING",
                amount: course.price || 0,
                type: "COD",
            },
        });

        console.log("[ENROLL_COD] Created pending purchase:", purchase.id);

        try {
            await createNotification({
                userId,
                title: "Enrollment Requested (COD)",
                message: `Your request to enroll in "${course.title}" via Cash on Delivery has been received. Please complete the payment to get access.`,
                type: NotificationType.ENROLLMENT,
                href: `/courses/${courseId}`,
                metadata: { courseId }
            });

            // Notify admins about new COD request
            const admins = await db.user.findMany({
                where: { role: "ADMIN" },
                select: { id: true }
            });

            for (const admin of admins) {
                await createNotification({
                    userId: admin.id,
                    title: "New Enrollment Request (COD)",
                    message: `${guestDetails?.name || session?.user?.name || "A student"} requested enrollment in "${course.title}".`,
                    type: NotificationType.ENROLLMENT,
                    href: "/admin/payments",
                    metadata: { purchaseId: purchase.id }
                });
            }
        } catch (notifError) {
            console.log("[ENROLL_COD_NOTIF_ERROR]", notifError);
            // Don't fail the whole enrollment if notification fails
        }

        if (guestDetails) {
            await sendEnrollmentEmail(
                guestDetails.email,
                course.title,
                course.price || 0,
                purchase.id,
                generatedPassword || undefined
            );
        }

        revalidatePath(`/courses/${courseId}`);
        return { success: true, purchase, isGuest: !!guestDetails };
    } catch (error: any) {
        console.log("[ENROLL_COD_ERROR]", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Something went wrong"
        };
    }
};

/**
 * Get the current purchase status for a course.
 */
export const getPurchaseStatus = async (courseId: string) => {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        if (!userId) return null;

        const purchase = await db.purchase.findUnique({
            where: {
                userId_courseId: {
                    userId,
                    courseId,
                }
            }
        });

        return purchase;
    } catch (error) {
        return null;
    }
};

/**
 * Get all purchases for admin management.
 */
export const getAdminPurchases = async () => {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            throw new Error("Unauthorized");
        }

        const purchases = await db.purchase.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        image: true,
                    }
                },
                course: {
                    select: {
                        title: true,
                    }
                }
            }
        });

        return purchases;
    } catch (error) {
        console.log("[GET_ADMIN_PURCHASES_ERROR]", error);
        return [];
    }
};

/**
 * Approve a pending COD purchase.
 */
export const approvePurchase = async (purchaseId: string) => {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            throw new Error("Unauthorized");
        }

        const purchase = await db.purchase.update({
            where: { id: purchaseId },
            data: { status: "COMPLETED" },
            include: { course: true }
        });

        await createNotification({
            userId: purchase.userId,
            title: "Enrollment Approved",
            message: `Your enrollment for "${purchase.course.title}" has been approved. You can now access the course content.`,
            type: NotificationType.ENROLLMENT,
            href: `/courses/${purchase.courseId}`,
            metadata: { courseId: purchase.courseId }
        });

        revalidatePath("/admin/payments");
        return { success: true };
    } catch (error) {
        console.log("[APPROVE_PURCHASE_ERROR]", error);
        return { success: false, error: "Failed to approve purchase" };
    }
};

/**
 * Reject/Cancel a purchase.
 */
export const rejectPurchase = async (purchaseId: string) => {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            throw new Error("Unauthorized");
        }

        // We can either delete it or mark as CANCELLED. Deleting allows them to try again.
        await db.purchase.delete({
            where: { id: purchaseId }
        });

        revalidatePath("/admin/payments");
        return { success: true };
    } catch (error) {
        console.log("[REJECT_PURCHASE_ERROR]", error);
        return { success: false, error: "Failed to reject purchase" };
    }
};
