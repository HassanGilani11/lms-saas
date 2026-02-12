"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";

type CourseWithProgress = {
    id: string;
    title: string;
    imageUrl: string | null;
    price: number | null;
    progress: number | null;
    category: { name: string } | null;
    lessons: { id: string }[];
    isEnrolled: boolean;
    lastActivity?: Date | null;
};

export const getCoursesWithProgress = async (): Promise<CourseWithProgress[]> => {
    try {
        let session = null;
        try {
            session = await auth();
        } catch (error) {
            console.log("[GET_COURSES_WITH_PROGRESS] Auth error (ignoring for guest):", error);
        }

        const userId = session?.user?.id;
        const isAdmin = session?.user?.role === "ADMIN";

        const include: any = {
            category: true,
            lessons: {
                where: isAdmin ? {} : { isPublished: true },
                include: {
                    topics: {
                        where: isAdmin ? {} : { isPublished: true },
                    }
                }
            }
        };

        if (userId) {
            include.purchases = {
                where: { userId }
            };
        }

        const courses = await db.course.findMany({
            where: {
                isPublished: isAdmin ? undefined : true,
                hideFromCatalog: isAdmin ? undefined : false,
            },
            include,
            orderBy: {
                createdAt: "desc"
            }
        });

        const coursesWithProgress = await Promise.all(
            courses.map(async (course: any) => {
                try {
                    // Safe access to purchases for guest users
                    const isEnrolled = (course.purchases?.length || 0) > 0 || isAdmin;
                    let progress = null;
                    let lastActivity = null;

                    if (isEnrolled && userId) {
                        const publishedTopics = course.lessons.flatMap((lesson: any) =>
                            lesson.topics.map((topic: any) => topic.id)
                        );

                        const completedTopics = await db.userProgress.count({
                            where: {
                                userId,
                                topicId: { in: publishedTopics },
                                isCompleted: true,
                            }
                        });

                        progress = publishedTopics.length > 0
                            ? (completedTopics / publishedTopics.length) * 100
                            : 0;

                        const lastProgress = await db.userProgress.findFirst({
                            where: {
                                userId,
                                topicId: { in: publishedTopics },
                            },
                            orderBy: { updatedAt: "desc" },
                            select: { updatedAt: true }
                        });
                        lastActivity = lastProgress?.updatedAt;
                    }

                    return {
                        id: course.id,
                        title: course.title,
                        imageUrl: course.imageUrl,
                        price: course.price,
                        progress,
                        category: course.category,
                        lessons: course.lessons,
                        isEnrolled,
                        lastActivity,
                    };
                } catch (error) {
                    console.log("[GET_COURSES_WITH_PROGRESS] Check error in map:", error);
                    return null;
                }
            })
        );

        // Filter out nulls
        const validCourses = coursesWithProgress.filter((c): c is CourseWithProgress => c !== null);

        return validCourses;
    } catch (error) {
        console.log("[GET_COURSES_WITH_PROGRESS] ERROR:", error);
        return [];
    }
};
