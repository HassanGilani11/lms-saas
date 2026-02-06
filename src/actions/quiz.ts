"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export const getQuiz = async (quizId: string) => {
    try {
        const session = await auth();
        if (!session?.user) {
            throw new Error("Unauthorized");
        }

        const quiz = await db.quiz.findUnique({
            where: { id: quizId },
            include: {
                questions: {
                    orderBy: {
                        position: "asc",
                    },
                    include: {
                        options: {
                            orderBy: {
                                position: "asc",
                            }
                        }
                    }
                },
                topics: true, // If linked to a topic
                course: {
                    select: { id: true, title: true }
                }
            },
        });

        return quiz;
    } catch (error) {
        console.log("[GET_QUIZ]", error);
        return null;
    }
};

export const getQuizzes = async () => {
    try {
        const session = await auth();
        if (!session?.user) {
            throw new Error("Unauthorized");
        }

        const quizzes = await db.quiz.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                topics: true,
                course: true,
                _count: {
                    select: { questions: true }
                }
            }
        });

        return quizzes;
    } catch (error) {
        console.log("[GET_QUIZZES]", error);
        return [];
    }
};

export const createQuiz = async (courseId: string, title: string) => {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            throw new Error("Unauthorized");
        }

        const quiz = await db.quiz.create({
            data: {
                title,
                courseId,
            },
        });

        revalidatePath(`/admin/courses/${courseId}`);
        return quiz;
    } catch (error) {
        console.log("[CREATE_QUIZ]", error);
        return null;
    }
};

export const updateQuiz = async (quizId: string, values: any) => {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            throw new Error("Unauthorized");
        }

        const quiz = await db.quiz.update({
            where: {
                id: quizId,
            },
            data: {
                ...values,
            },
        });

        revalidatePath(`/admin/quizzes/${quizId}`);
        return quiz;
    } catch (error) {
        console.log("[UPDATE_QUIZ]", error);
        throw error;
    }
};

export const deleteQuiz = async (quizId: string) => {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            throw new Error("Unauthorized");
        }

        const quiz = await db.quiz.delete({
            where: {
                id: quizId,
            },
        });

        return quiz;
    } catch (error) {
        console.log("[DELETE_QUIZ]", error);
        throw error;
    }
};

export const getQuizForStudent = async (quizId: string) => {
    try {
        const session = await auth();
        if (!session?.user) {
            throw new Error("Unauthorized");
        }

        const quiz = await db.quiz.findUnique({
            where: { id: quizId },
            include: {
                questions: {
                    include: {
                        options: {
                            orderBy: { position: "asc" }
                        }
                    },
                    orderBy: { position: "asc" }
                }
            }
        });

        if (!quiz) return null;

        // Shuffle questions if enabled
        if (quiz.shuffleQuestions) {
            for (let i = quiz.questions.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [quiz.questions[i], quiz.questions[j]] = [quiz.questions[j], quiz.questions[i]];
            }
        }

        // Sanitize: Remove correct answers
        const sanitizedQuestions = quiz.questions.map(q => {
            const { correctAnswer, ...restQ } = q;
            const sanitizedOptions = q.options.map(o => {
                const { isCorrect, ...restO } = o;
                return restO;
            });
            return { ...restQ, options: sanitizedOptions };
        });

        return { ...quiz, questions: sanitizedQuestions };

    } catch (error) {
        console.log("[GET_STUDENT_QUIZ]", error);
        return null;
    }
};
