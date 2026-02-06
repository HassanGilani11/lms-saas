"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

/**
 * Get global platform-level statistics for Admins.
 */
export const getGlobalStats = async () => {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            throw new Error("Unauthorized");
        }

        const totalUsers = await db.user.count();
        const totalCourses = await db.course.count();
        const totalPurchases = await db.purchase.count();

        // Mock revenue calculation: in a real app, you'd store successful charge amounts in a Sales table.
        // Here we'll sum the prices of all courses that have been purchased.
        const purchases = await db.purchase.findMany({
            include: {
                course: {
                    select: {
                        price: true,
                    }
                }
            }
        });

        const calculatedRevenue = purchases.reduce((acc: number, curr: any) => acc + (curr.course.price || 0), 0);

        return {
            totalUsers,
            totalCourses,
            totalPurchases,
            totalRevenue: calculatedRevenue,
        };
    } catch (error) {
        console.log("[GET_GLOBAL_STATS]", error);
        return null;
    }
};

/**
 * Get instructor-specific statistics.
 */
export const getInstructorStats = async () => {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        if (!userId || session.user.role !== "INSTRUCTOR") {
            throw new Error("Unauthorized");
        }

        // Get all courses owned by this instructor
        const courses = await db.course.findMany({
            where: { userId },
            include: {
                purchases: true,
            }
        });

        const totalCourses = courses.length;
        const totalEnrollments = courses.reduce((acc: number, curr: any) => acc + curr.purchases.length, 0);
        const totalRevenue = courses.reduce((acc: number, curr: any) => {
            const courseRevenue = curr.purchases.length * (curr.price || 0);
            return acc + courseRevenue;
        }, 0);

        return {
            totalCourses,
            totalEnrollments,
            totalRevenue,
        };
    } catch (error) {
        console.log("[GET_INSTRUCTOR_STATS]", error);
        return null;
    }
};

/**
 * Get course-level engagement metrics for an instructor.
 */
export const getCourseEngagement = async (courseId: string) => {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        if (!userId) {
            throw new Error("Unauthorized");
        }

        const course = await db.course.findUnique({
            where: { id: courseId, userId },
            include: {
                lessons: {
                    include: {
                        userProgress: true,
                    }
                }
            }
        });

        if (!course) {
            throw new Error("Course not found or unauthorized");
        }

        // Calculate engagement: total lessons vs total completions
        let totalLessons = 0;
        let totalCompletions = 0;

        course.lessons.forEach((lesson: any) => {
            totalLessons++;
            totalCompletions += lesson.userProgress.filter((p: any) => p.isCompleted).length;
        });

        const avgCompletionRate = totalLessons > 0 ? (totalCompletions / (totalLessons * (course as any).purchases?.length || 1)) : 0;
        // This is a naive calculation. Better: total potential completions (lessons * users) vs actual.

        return {
            totalLessons,
            avgCompletionRate,
        };
    } catch (error) {
        console.log("[GET_COURSE_ENGAGEMENT]", error);
        return null;
    }
};

/**
 * Get recent system activities for the Admin dashboard.
 * Aggregates data from User creation, Course updates, and Purchases.
 */
export const getRecentActivities = async () => {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            throw new Error("Unauthorized");
        }

        const [users, courses, purchases] = await Promise.all([
            // New Users
            db.user.findMany({
                take: 3,
                orderBy: { createdAt: "desc" },
                select: { id: true, name: true, image: true, createdAt: true }
            }),
            // Course Updates (published/created)
            db.course.findMany({
                take: 3,
                orderBy: { updatedAt: "desc" },
                select: { id: true, title: true, updatedAt: true, user: { select: { name: true, image: true } } }
            }),
            // New Purchases
            db.purchase.findMany({
                take: 3,
                orderBy: { createdAt: "desc" },
                include: {
                    user: { select: { name: true, image: true } },
                    course: { select: { title: true } }
                }
            })
        ]);

        const activities = [
            ...users.map(u => ({
                id: `user-${u.id}`,
                user: u.name || "Unknown User",
                avatar: u.image,
                action: "New user registered",
                time: u.createdAt,
            })),
            ...courses.map(c => ({
                id: `course-${c.id}`,
                user: c.user?.name || "Instructor",
                avatar: c.user?.image,
                action: `Updated course: ${c.title}`,
                time: c.updatedAt,
            })),
            ...purchases.map(p => ({
                id: `purchase-${p.id}`,
                user: p.user?.name || "Student",
                avatar: p.user?.image,
                action: `Purchased ${p.course.title}`,
                time: p.createdAt,
            }))
        ];

        // Sort by most recent
        return activities
            .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
            .slice(0, 10);

    } catch (error) {
        console.log("[GET_RECENT_ACTIVITIES]", error);
        return [];
    }
};
