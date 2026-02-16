"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";

export const getStudentDashboardData = async () => {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        if (!userId) {
            return {
                user: null,
                stats: {
                    courses: 0,
                    completed: 0,
                    certificates: 0,
                    points: 0,
                },
                courses: [],
            };
        }

        const user = await db.user.findUnique({
            where: { id: userId },
            select: {
                name: true,
                image: true,
                email: true,
                username: true,
            }
        });

        // 1. Fetch Enrolled Courses with Progress
        const purchases = await db.purchase.findMany({
            where: {
                userId,
                status: "COMPLETED",
            },
            include: {
                course: {
                    include: {
                        category: true,
                        lessons: {
                            where: { isPublished: true },
                            include: {
                                topics: {
                                    where: { isPublished: true },
                                }
                            }
                        }
                    }
                }
            }
        });

        const enrolledCoursesWithProgress = await Promise.all(
            purchases.map(async (purchase) => {
                const course = purchase.course;
                const publishedTopics = course.lessons.flatMap((lesson) =>
                    lesson.topics.map((topic) => topic.id)
                );

                const completedTopics = await db.userProgress.findMany({
                    where: {
                        userId,
                        topicId: { in: publishedTopics },
                        isCompleted: true,
                    },
                    orderBy: { updatedAt: "desc" },
                });

                const completedTopicsCount = completedTopics.length;
                const lastActivity = completedTopics[0]?.updatedAt;

                const progress = publishedTopics.length > 0
                    ? Math.round((completedTopicsCount / publishedTopics.length) * 100)
                    : 0;

                return {
                    id: course.id,
                    title: course.title,
                    description: course.description,
                    imageUrl: course.imageUrl,
                    price: course.price,
                    category: course.category?.name || "Uncategorized",
                    progress,
                    lessons: course.lessons, // For CourseCard compatibility
                    lessonsCount: course.lessons.length,
                    isCompleted: progress === 100,
                    lastActivity,
                    isEnrolled: true,
                };
            })
        );

        // 2. Fetch Stats
        const completedCoursesCount = enrolledCoursesWithProgress.filter(c => c.isCompleted).length;

        const certificatesCount = await db.certificate.count({
            where: { userId }
        });

        const userAchievements = await db.userAchievement.findMany({
            where: { userId },
            include: {
                achievement: true
            }
        });

        const totalPoints = userAchievements.reduce((acc, curr) => acc + (curr.achievement.xp || 0), 0);

        return {
            user,
            stats: {
                courses: enrolledCoursesWithProgress.length,
                completed: completedCoursesCount,
                certificates: certificatesCount,
                points: totalPoints,
            },
            courses: enrolledCoursesWithProgress,
        };

    } catch (error) {
        console.error("[GET_STUDENT_DASHBOARD_DATA]", error);
        return {
            user: null,
            stats: {
                courses: 0,
                completed: 0,
                certificates: 0,
                points: 0,
            },
            courses: [],
        };
    }
};
