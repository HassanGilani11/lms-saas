"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

/**
 * Fetch purchase history for the current student.
 */
export const getMyOrders = async () => {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        if (!userId) throw new Error("Unauthorized");

        const orders = await db.purchase.findMany({
            where: { userId },
            include: {
                course: {
                    select: {
                        title: true,
                        imageUrl: true,
                        price: true,
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        return orders;
    } catch (error) {
        console.log("[GET_ORDERS]", error);
        return [];
    }
};

/**
 * Get revenue statistics for the current instructor.
 */
export const getInstructorRevenue = async () => {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        if (!userId) throw new Error("Unauthorized");

        const purchases = await db.purchase.findMany({
            where: {
                course: {
                    userId: userId // Only courses owned by this instructor
                },
                status: "COMPLETED"
            },
            include: {
                course: {
                    select: {
                        title: true,
                    }
                }
            }
        });

        const totalRevenue = purchases.reduce((acc, purchase) => acc + (purchase.amount || 0), 0);
        const totalSales = purchases.length;

        // Group by course
        const revenueByCourse = purchases.reduce((acc: any, purchase) => {
            const courseTitle = purchase.course.title;
            if (!acc[courseTitle]) {
                acc[courseTitle] = 0;
            }
            acc[courseTitle] += purchase.amount || 0;
            return acc;
        }, {});

        return {
            totalRevenue,
            totalSales,
            revenueByCourse: Object.entries(revenueByCourse).map(([title, amount]) => ({
                title,
                amount
            }))
        };
    } catch (error) {
        console.log("[GET_REVENUE]", error);
        return {
            totalRevenue: 0,
            totalSales: 0,
            revenueByCourse: []
        };
    }
};

/**
 * Fetch recent system activities for the admin dashboard.
 */
export const getRecentActivities = async () => {
    try {
        // Fetch recent users
        const newUsers = await db.user.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
        });

        // Fetch recent purchases
        const newPurchases = await db.purchase.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            include: {
                user: true,
                course: true,
            }
        });

        // Map to common activity format
        // Shape expected: { id, avatar, user, action, time }
        const userActivities = newUsers.map((user) => ({
            id: `user-${user.id}`,
            avatar: user.image,
            user: user.name || user.email || "Unknown User",
            action: "Registered on the platform",
            time: user.createdAt,
        }));

        const purchaseActivities = newPurchases.map((purchase) => ({
            id: `purchase-${purchase.id}`,
            avatar: purchase.user.image,
            user: purchase.user.name || purchase.user.email || "Unknown User",
            action: `Enrolled in "${purchase.course.title}"`,
            time: purchase.createdAt,
        }));

        // Combine and sort by most recent
        const allActivities = [...userActivities, ...purchaseActivities]
            .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
            .slice(0, 10);

        return allActivities;
    } catch (error) {
        console.log("[GET_RECENT_ACTIVITIES]", error);
        return [];
    }
};

/**
 * Get course completion rates for the admin reports.
 */
export const getCourseCompletionRates = async () => {
    try {
        const courses = await db.course.findMany({
            where: { isPublished: true },
            include: {
                lessons: {
                    where: { isPublished: true },
                    include: {
                        topics: {
                            where: { isPublished: true }
                        }
                    }
                },
                purchases: true
            }
        });

        const completionData = await Promise.all(courses.map(async (course) => {
            const totalTopics = course.lessons.reduce((acc, lesson) => acc + lesson.topics.length, 0);

            if (totalTopics === 0) return null;

            const enrolledUserIds = course.purchases.map(p => p.userId);
            if (enrolledUserIds.length === 0) {
                return {
                    id: course.id,
                    title: course.title,
                    studentCount: 0,
                    completionRate: 0
                };
            }

            // Get progress for all enrolled users
            const totalProgress = await db.userProgress.count({
                where: {
                    userId: { in: enrolledUserIds },
                    topic: { lesson: { courseId: course.id } },
                    isCompleted: true
                }
            });

            // Calculate average completion rate
            // Total possible completions = users * topics
            const totalPossible = enrolledUserIds.length * totalTopics;
            const completionRate = totalPossible > 0 ? Math.round((totalProgress / totalPossible) * 100) : 0;

            return {
                id: course.id,
                title: course.title,
                studentCount: enrolledUserIds.length,
                completionRate
            };
        }));

        return completionData.filter(Boolean);
    } catch (error) {
        console.log("[GET_COURSE_COMPLETION_RATES]", error);
        return [];
    }
};

/**
 * Get quiz performance analytics for admin reports.
 */
export const getQuizPerformanceAnalytics = async () => {
    try {
        const quizzes = await db.quiz.findMany({
            include: {
                course: true,
                attempts: true
            }
        });

        return quizzes.map(quiz => {
            const totalAttempts = quiz.attempts.length;
            if (totalAttempts === 0) {
                return {
                    id: quiz.id,
                    title: quiz.title,
                    course: quiz.course?.title || "N/A",
                    avgScore: 0,
                    passRate: 0,
                    totalAttempts: 0
                };
            }

            const totalScore = quiz.attempts.reduce((acc, attempt) => acc + attempt.score, 0);
            const avgScore = Math.round(totalScore / totalAttempts);

            const passedAttempts = quiz.attempts.filter(a => a.score >= quiz.passingScore).length;
            const passRate = Math.round((passedAttempts / totalAttempts) * 100);

            return {
                id: quiz.id,
                title: quiz.title,
                course: quiz.course?.title || "N/A",
                avgScore,
                passRate,
                totalAttempts
            };
        });
    } catch (error) {
        console.log("[GET_QUIZ_ANALYTICS]", error);
        return [];
    }
};

/**
 * Get time spent analytics for admin reports.
 */
export const getTimeSpentAnalytics = async () => {
    try {
        // Aggregate time spent by course
        const timeLogs = await db.timeLog.groupBy({
            by: ['courseId'],
            _sum: {
                duration: true
            }
        });

        // Enrich with course details
        const data = await Promise.all(timeLogs.map(async (log) => {
            if (!log.courseId) return null;

            const course = await db.course.findUnique({
                where: { id: log.courseId },
                select: { title: true }
            });

            if (!course) return null;

            return {
                courseId: log.courseId,
                title: course.title,
                totalMinutes: Math.round((log._sum.duration || 0) / 60)
            };
        }));

        return data.filter(Boolean);
    } catch (error) {
        console.log("[GET_TIME_ANALYTICS]", error);
        return [];
    }
};

/**
 * Get group level analytics for admin reports.
 */
export const getGroupLevelAnalytics = async () => {
    try {
        const groups = await db.group.findMany({
            include: {
                users: {
                    include: {
                        quizAttempts: true,
                        userAchievements: true
                    }
                }
            }
        });

        return groups.map(group => {
            const userCount = group.users.length;

            // Calculate avg quiz score for group members
            let totalScore = 0;
            let totalAttempts = 0;
            let totalAchievements = 0;

            group.users.forEach(user => {
                totalAchievements += user.userAchievements.length;
                user.quizAttempts.forEach(attempt => {
                    totalScore += attempt.score;
                    totalAttempts++;
                });
            });

            const avgQuizScore = totalAttempts > 0 ? Math.round(totalScore / totalAttempts) : 0;

            return {
                id: group.id,
                name: group.name,
                userCount,
                avgQuizScore,
                totalAchievements
            };
        });
    } catch (error) {
        console.log("[GET_GROUP_ANALYTICS]", error);
        return [];
    }
};
