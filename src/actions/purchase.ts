"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { createNotification } from "@/actions/notifications";
import { NotificationType } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendEnrollmentEmail } from "@/lib/mail";
import { getSettings } from "@/actions/settings";


/**
 * Handle Cash on Delivery (COD) enrollment.
 * Creates a Purchase record with PENDING status.
 */
export const enrollWithCod = async (courseId: string, details: { email: string; name: string; phone: string; address: string }) => {
    try {
        console.log("[ENROLL_COD] Starting enrollment for course:", courseId);
        const session = await auth();
        let userId = session?.user?.id;
        const isAdmin = session?.user?.role === "ADMIN";

        let generatedPassword = "";

        const { email, name, phone, address } = details;

        // Handle User Creation or Update
        if (!userId) {
            // Check if user exists
            const existingUser = await db.user.findUnique({
                where: { email }
            });

            if (existingUser) {
                userId = existingUser.id;
                // Update existing user's missing info if needed, or just proceed
                // We might want to update phone/address if they provided new ones
                await db.user.update({
                    where: { id: userId },
                    data: { phone, address }
                });
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
                        phone,
                        address,
                    }
                });
                userId = newUser.id;
            }
        } else {
            // Logged in user - update profile with new details
            await db.user.update({
                where: { id: userId },
                data: { phone, address }
            });
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

        const settings = await getSettings();
        const displayCurrency = settings?.stripeCurrency || "USD";
        const exchangeRates = settings?.exchangeRates as any || {};
        const baseCurrency = settings?.baseCurrency || "USD";

        let finalAmount = course.price || 0;
        if (displayCurrency !== baseCurrency && exchangeRates[displayCurrency]) {
            finalAmount = course.price! * exchangeRates[displayCurrency];
        }

        const purchase = await db.purchase.create({
            data: {
                userId,
                courseId,
                status: "PENDING",
                amount: finalAmount,
                currency: displayCurrency,
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
                    message: `${details.name} requested enrollment in "${course.title}".`,
                    type: NotificationType.ENROLLMENT,
                    href: "/admin/payments",
                    metadata: { purchaseId: purchase.id }
                });
            }

            // Notify Instructor
            await createNotification({
                userId: course.userId,
                title: "New Enrollment Request",
                message: `${details.name} requested enrollment in your course "${course.title}".`,
                type: NotificationType.ENROLLMENT,
                href: "/instructor/courses",
                metadata: { courseId: course.id, purchaseId: purchase.id }
            });
        } catch (notifError) {
            console.log("[ENROLL_COD_NOTIF_ERROR]", notifError);
            // Don't fail the whole enrollment if notification fails
        }

        if (generatedPassword) {
            await sendEnrollmentEmail(
                details.email,
                course.title,
                course.price || 0,
                purchase.id,
                generatedPassword
            );
        }

        revalidatePath(`/courses/${courseId}`);
        return { success: true, purchase, isGuest: !!generatedPassword };
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
