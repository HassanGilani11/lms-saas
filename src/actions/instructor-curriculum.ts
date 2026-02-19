"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

/**
 * Fetches all courses owned by the authenticated instructor.
 */
export const getInstructorCourses = async () => {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        if (!userId) {
            return [];
        }

        const courses = await db.course.findMany({
            where: {
                userId: userId,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return courses;
    } catch (error) {
        console.error("[GET_INSTRUCTOR_COURSES]", error);
        return [];
    }
};

/**
 * Fetches all lessons belonging to the authenticated instructor's courses.
 */
export const getInstructorLessons = async () => {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        if (!userId) {
            return [];
        }

        const lessons = await db.lesson.findMany({
            where: {
                course: {
                    userId: userId,
                },
            },
            include: {
                course: true,
                _count: {
                    select: {
                        topics: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return lessons;
    } catch (error) {
        console.error("[GET_INSTRUCTOR_LESSONS]", error);
        return [];
    }
};

/**
 * Fetches all topics belonging to the authenticated instructor's courses.
 */
export const getInstructorTopics = async () => {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        if (!userId) {
            return [];
        }

        const topics = await db.topic.findMany({
            where: {
                lesson: {
                    course: {
                        userId: userId,
                    },
                },
            },
            include: {
                lesson: {
                    include: {
                        course: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return topics;
    } catch (error) {
        console.error("[GET_INSTRUCTOR_TOPICS]", error);
        return [];
    }
};

/**
 * Fetches all quizzes belonging to the authenticated instructor's courses.
 */
export const getInstructorQuizzes = async () => {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        if (!userId) {
            return [];
        }

        const quizzes = await db.quiz.findMany({
            where: {
                OR: [
                    {
                        course: {
                            userId: userId,
                        },
                    },
                    {
                        topics: {
                            lesson: {
                                course: {
                                    userId: userId,
                                },
                            },
                        },
                    },
                ],
            },
            include: {
                course: true,
                topics: {
                    include: {
                        lesson: {
                            include: {
                                course: true,
                            },
                        },
                    },
                },
                _count: {
                    select: { questions: true }
                }
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return quizzes;
    } catch (error) {
        console.error("[GET_INSTRUCTOR_QUIZZES]", error);
        return [];
    }
};

/**
 * Fetches certificates for the authenticated instructor's courses.
 */
export const getInstructorCertificates = async () => {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        if (!userId) {
            return [];
        }

        const certificates = await db.certificate.findMany({
            where: {
                course: {
                    userId: userId,
                },
            },
            include: {
                course: true,
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                issuedAt: "desc",
            },
        });

        return certificates;
    } catch (error) {
        console.error("[GET_INSTRUCTOR_CERTIFICATES]", error);
        return [];
    }
};

/**
 * Fetches a single quiz for the authenticated instructor with ownership validation.
 */
export const getInstructorQuizDetail = async (quizId: string) => {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        if (!userId) {
            return null;
        }

        const quiz = await db.quiz.findUnique({
            where: {
                id: quizId,
            },
            include: {
                course: true,
                topics: {
                    include: {
                        lesson: {
                            include: {
                                course: true,
                            },
                        },
                    },
                },
                questions: {
                    orderBy: {
                        position: "asc",
                    },
                    include: {
                        options: {
                            orderBy: {
                                position: "asc",
                            },
                        },
                    },
                },
            },
        });

        if (!quiz) return null;

        // Verify ownership (either directly or via topic -> lesson -> course)
        const isOwner = (quiz.course?.userId === userId) || (quiz.topics?.lesson?.course?.userId === userId);

        if (!isOwner) {
            return null;
        }

        return quiz;
    } catch (error) {
        console.error("[GET_INSTRUCTOR_QUIZ_DETAIL]", error);
        return null;
    }
};

/**
 * Fetches analytics for a specific quiz belonging to the instructor.
 */
export const getInstructorQuizAnalytics = async (quizId: string) => {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        if (!userId) return null;

        const quiz = await db.quiz.findUnique({
            where: { id: quizId },
            select: {
                passingScore: true,
                course: { select: { userId: true } },
                topics: { select: { lesson: { select: { course: { select: { userId: true } } } } } }
            }
        });

        if (!quiz) return null;

        // Ownership check
        const isOwner = (quiz.course?.userId === userId) || (quiz.topics?.lesson?.course?.userId === userId);
        if (!isOwner) return null;

        const attempts = await db.quizAttempt.findMany({
            where: { quizId: quizId, status: "COMPLETED" },
        });

        const totalAttempts = attempts.length;
        const passingScore = quiz.passingScore || 70;
        const passCount = attempts.filter((a) => a.score >= passingScore).length;
        const averageScore = totalAttempts > 0
            ? attempts.reduce((acc, curr) => acc + curr.score, 0) / totalAttempts
            : 0;

        return {
            totalAttempts,
            passRate: totalAttempts > 0 ? (passCount / totalAttempts) * 100 : 0,
            averageScore,
        };
    } catch (error) {
        console.error("[GET_INSTRUCTOR_QUIZ_ANALYTICS]", error);
        return null;
    }
};
