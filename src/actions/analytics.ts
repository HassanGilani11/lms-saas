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

        const totalRevenue = await db.purchase.aggregate({
            _sum: {
                // Since we don't store the exact price in Purchase yet (redundant with Course), 
                // we'd normally join or sum course prices. For MVP, we'll sum course prices of all purchases.
            }
        });

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
                modules: {
                    include: {
                        lessons: {
                            include: {
                                userProgress: true,
                            }
                        }
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

        course.modules.forEach((module: any) => {
            module.lessons.forEach((lesson: any) => {
                totalLessons++;
                totalCompletions += lesson.userProgress.filter((p: any) => p.isCompleted).length;
            });
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
