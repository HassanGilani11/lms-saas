"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

/**
 * Start a new quiz attempt.
 */
export const startQuizAttempt = async (quizId: string) => {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        if (!userId) {
            throw new Error("Unauthorized");
        }

        const quiz = await db.quiz.findUnique({
            where: { id: quizId },
        });

        if (!quiz) {
            throw new Error("Quiz not found");
        }

        // Check attempt limits
        if (quiz.maxAttempts) {
            const attemptCount = await db.quizAttempt.count({
                where: { userId, quizId },
            });

            if (attemptCount >= quiz.maxAttempts) {
                throw new Error("Maximum attempts reached");
            }
        }

        const attempt = await db.quizAttempt.create({
            data: {
                userId,
                quizId,
            },
        });

        return attempt;
    } catch (error) {
        console.log("[START_QUIZ_ATTEMPT]", error);
        return null;
    }
};

/**
 * Submit answers for a quiz attempt and auto-grade.
 */
export const submitQuizAttempt = async (
    attemptId: string,
    answers: { questionId: string; optionId: string }[]
) => {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        if (!userId) {
            throw new Error("Unauthorized");
        }

        const attempt = await db.quizAttempt.findUnique({
            where: { id: attemptId, userId },
            include: {
                quiz: {
                    include: {
                        questions: {
                            include: {
                                options: true,
                            },
                        },
                    },
                },
            },
        });

        if (!attempt || attempt.status === "COMPLETED") {
            throw new Error("Invalid or completed attempt");
        }

        // Save user answers as quiz responses
        await db.quizResponse.createMany({
            data: answers.map((answer) => ({
                attemptId,
                questionId: answer.questionId,
                answer: answer.optionId, // Store optionId as the answer
            })),
        });

        // Auto-grading logic
        let correctCount = 0;
        const totalQuestions = attempt.quiz.questions.length;

        attempt.quiz.questions.forEach((question: any) => {
            const userAnswer = answers.find((a) => a.questionId === question.id);
            const correctOption = question.options.find((o: any) => o.isCorrect);

            if (userAnswer && correctOption && userAnswer.optionId === correctOption.id) {
                correctCount++;
            }
        });

        const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
        const isPassed = score >= attempt.quiz.passingScore;

        const updatedAttempt = await db.quizAttempt.update({
            where: { id: attemptId },
            data: {
                score,
                status: "COMPLETED",
                completedAt: new Date(),
            },
        });

        return updatedAttempt;
    } catch (error) {
        console.log("[SUBMIT_QUIZ_ATTEMPT]", error);
        return null;
    }
};

/**
 * Get quiz result analytics for instructors.
 */
export const getQuizAnalytics = async (quizId: string) => {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        if (!userId || session.user.role !== "INSTRUCTOR") {
            throw new Error("Unauthorized");
        }

        const attempts = await db.quizAttempt.findMany({
            where: { quizId, status: "COMPLETED" },
        });

        const totalAttempts = attempts.length;
        const passingScore = 70; // Fallback or fetch from quiz
        const passCount = attempts.filter((a: any) => a.score >= passingScore).length;
        const averageScore = totalAttempts > 0
            ? attempts.reduce((acc: number, curr: any) => acc + curr.score, 0) / totalAttempts
            : 0;

        return {
            totalAttempts,
            passRate: totalAttempts > 0 ? (passCount / totalAttempts) * 100 : 0,
            averageScore,
        };
    } catch (error) {
        console.log("[GET_QUIZ_ANALYTICS]", error);
        return null;
    }
};

export const createQuiz = async (courseId: string, title: string) => {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        if (!userId || session.user.role !== "INSTRUCTOR") {
            throw new Error("Unauthorized");
        }

        const quiz = await db.quiz.create({
            data: {
                title,
                courseId,
            },
        });

        return quiz;
    } catch (error) {
        console.log("[CREATE_QUIZ]", error);
        return null;
    }
};

export const updateQuiz = async (quizId: string, values: any) => {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        if (!userId) {
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

        return quiz;
    } catch (error) {
        console.log("[UPDATE_QUIZ]", error);
        return null;
    }
};

export const deleteQuiz = async (quizId: string) => {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        if (!userId) {
            throw new Error("Unauthorized");
        }

        const deletedQuiz = await db.quiz.delete({
            where: {
                id: quizId,
            },
        });

        return deletedQuiz;
    } catch (error) {
        console.log("[DELETE_QUIZ]", error);
        return null;
    }
};

export const createQuestion = async (quizId: string, text: string, type: "MULTIPLE_CHOICE" | "TRUE_FALSE") => {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        if (!userId) {
            throw new Error("Unauthorized");
        }

        const lastQuestion = await db.question.findFirst({
            where: { quizId },
            orderBy: { position: "desc" },
        });

        const newPosition = lastQuestion ? lastQuestion.position + 1 : 1;

        const question = await db.question.create({
            data: {
                text,
                type,
                quizId,
                position: newPosition,
            },
        });

        return question;
    } catch (error) {
        console.log("[CREATE_QUESTION]", error);
        return null;
    }
};

export const updateQuestion = async (questionId: string, values: any) => {
    try {
        const session = await auth();
        if (!session?.user?.id) throw new Error("Unauthorized");

        const question = await db.question.update({
            where: { id: questionId },
            data: { ...values },
        });

        return question;
    } catch (error) {
        console.log("[UPDATE_QUESTION]", error);
        return null;
    }
};

export const deleteQuestion = async (questionId: string) => {
    try {
        const session = await auth();
        if (!session?.user?.id) throw new Error("Unauthorized");

        const deletedQuestion = await db.question.delete({
            where: { id: questionId },
        });

        return deletedQuestion;
    } catch (error) {
        console.log("[DELETE_QUESTION]", error);
        return null;
    }
};

export const createOption = async (questionId: string, text: string, isCorrect: boolean) => {
    try {
        const lastOption = await db.option.findFirst({
            where: { questionId },
            orderBy: { position: "desc" },
        });

        const newPosition = lastOption ? lastOption.position + 1 : 1;

        return await db.option.create({
            data: {
                text,
                isCorrect,
                questionId,
                position: newPosition,
            }
        });
    } catch (error) {
        console.log("[CREATE_OPTION]", error);
        return null;
    }
};

export const updateOption = async (optionId: string, values: any) => {
    try {
        const session = await auth();
        if (!session?.user?.id) throw new Error("Unauthorized");

        return await db.option.update({
            where: { id: optionId },
            data: { ...values },
        });
    } catch (error) {
        console.log("[UPDATE_OPTION]", error);
        return null;
    }
};

export const deleteOption = async (optionId: string) => {
    try {
        const session = await auth();
        if (!session?.user?.id) throw new Error("Unauthorized");

        return await db.option.delete({
            where: { id: optionId },
        });
    } catch (error) {
        console.log("[DELETE_OPTION]", error);
        return null;
    }
};
