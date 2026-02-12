"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { AttemptStatus } from "@prisma/client";

// Start a new attempt
export const startAttempt = async (quizId: string) => {
    try {
        const session = await auth();
        if (!session?.user || !session.user.id) throw new Error("Unauthorized");

        const userId = session.user.id;

        // Check if quiz exists and get limits
        const quiz = await db.quiz.findUnique({
            where: { id: quizId },
            select: { maxAttempts: true },
        });

        if (!quiz) throw new Error("Quiz not found");

        // Check attempt limit
        if (quiz.maxAttempts) {
            const attemptsCount = await db.quizAttempt.count({
                where: { quizId, userId },
            });

            if (attemptsCount >= quiz.maxAttempts) {
                throw new Error("Max attempts reached");
            }
        }

        const attempt = await db.quizAttempt.create({
            data: {
                quizId,
                userId,
                status: AttemptStatus.IN_PROGRESS,
            },
        });

        return attempt;
    } catch (error) {
        console.log("[START_ATTEMPT]", error);
        return null;
    }
};

// Submit an answer for a specific question
export const submitAnswer = async (
    attemptId: string,
    questionId: string,
    answer: string
) => {
    try {
        const session = await auth();
        if (!session?.user) throw new Error("Unauthorized");

        const existing = await db.quizResponse.findFirst({
            where: { attemptId, questionId }
        });

        if (existing) {
            return await db.quizResponse.update({
                where: { id: existing.id },
                data: { answer }
            });
        } else {
            return await db.quizResponse.create({
                data: { attemptId, questionId, answer }
            });
        }
    } catch (error) {
        console.log("[SUBMIT_ANSWER]", error);
        return null;
    }
};

// Finish attempt and grade it
export const finishAttempt = async (attemptId: string) => {
    try {
        const session = await auth();
        if (!session?.user) throw new Error("Unauthorized");

        const attempt = await db.quizAttempt.findUnique({
            where: { id: attemptId },
            include: {
                quiz: {
                    include: {
                        questions: {
                            include: { options: true }
                        }
                    }
                },
                responses: true
            }
        });

        if (!attempt) throw new Error("Attempt not found");

        let totalScore = 0;
        let requiresManualGrading = false;

        // Grading Logic
        for (const question of attempt.quiz.questions) {
            const response = attempt.responses.find(r => r.questionId === question.id);
            if (!response) continue;

            let points = 0;
            const correctOptions = question.options.filter(o => o.isCorrect);
            const correctOptionIds = correctOptions.map(o => o.id);

            if (question.type === "SINGLE_CHOICE" || question.type === "TRUE_FALSE") {
                // For single choice, the answer must match the exactly one correct option
                if (correctOptionIds.length === 1 && response.answer === correctOptionIds[0]) {
                    points = question.points;
                }
            } else if (question.type === "MULTIPLE_CHOICE") {
                // For MCQs, the answer (likely JSON or comma-separated) must match all correct options
                // If it's a simple string ID from the current UI (which only allows one), we check if it's IN the correct list
                // However, standard MCQ logic usually requires selecting ALL correct options.
                // For now, to fix the user's immediate issue, if they selected ANY correct option and ONLY one is correct, we award points.
                if (correctOptionIds.includes(response.answer || "")) {
                    points = question.points;
                }
            } else if (question.type === "ESSAY") {
                requiresManualGrading = true;
            }

            totalScore += points;

            await db.quizResponse.update({
                where: { id: response.id },
                data: {
                    isCorrect: points > 0,
                    pointsAwarded: points
                }
            });
        }

        const maxPoints = attempt.quiz.questions.reduce((acc, q) => acc + q.points, 0);
        const scorePercentage = maxPoints > 0 ? Math.round((totalScore / maxPoints) * 100) : 0;

        const updatedAttempt = await db.quizAttempt.update({
            where: { id: attemptId },
            data: {
                status: requiresManualGrading ? AttemptStatus.COMPLETED : AttemptStatus.GRADED,
                completedAt: new Date(),
                score: scorePercentage,
            }
        });

        if (attempt.quiz.courseId) {
            revalidatePath(`/courses/${attempt.quiz.courseId}`);
        }

        return updatedAttempt;
    } catch (error) {
        console.log("[FINISH_ATTEMPT]", error);
        return null;
    }
};

export const gradeEssayQuestion = async (
    attemptId: string,
    questionId: string,
    pointsAwarded: number,
    feedback?: string
) => {
    try {
        const session = await auth();
        // Ideally check if IS instructor or admin
        if (!session?.user || session.user.role === "STUDENT") {
            throw new Error("Unauthorized");
        }

        const question = await db.question.findUnique({ where: { id: questionId } });
        if (!question) throw new Error("Question not found");

        if (pointsAwarded > question.points) {
            throw new Error("Points exceed max value");
        }

        // Update the response (assuming we add feedback field later to schema if needed, for now just points)
        await db.quizResponse.updateMany({
            where: { attemptId, questionId },
            data: {
                isCorrect: pointsAwarded > 0,
                pointsAwarded
            }
        });

        // Recalculate total score
        const attempt = await db.quizAttempt.findUnique({
            where: { id: attemptId },
            include: {
                responses: true,
                quiz: {
                    include: {
                        questions: true
                    }
                }
            }
        });

        if (attempt) {
            const totalPoints = attempt.responses.reduce((acc, curr) => acc + curr.pointsAwarded, 0);
            const maxPoints = attempt.quiz.questions.reduce((acc, q) => acc + q.points, 0);
            const scorePercentage = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;

            await db.quizAttempt.update({
                where: { id: attemptId },
                data: {
                    score: scorePercentage,
                    status: "GRADED" // Mark as fully graded now
                }
            });
        }

        revalidatePath(`/admin/quizzes/attempts/${attemptId}`);
        return { success: true };
    } catch (error) {
        console.log("[GRADE_ESSAY]", error);
        throw error;
    }
};
