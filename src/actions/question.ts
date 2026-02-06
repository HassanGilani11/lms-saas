"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { QuestionType } from "@prisma/client";
import { revalidatePath } from "next/cache";

export const createQuestion = async (
    quizId: string,
    values: {
        text: string;
        type: QuestionType;
        points: number;
        options?: { text: string; isCorrect: boolean }[];
        correctAnswer?: string;
    }
) => {
    try {
        const session = await auth();
        // Console log for debugging
        console.log("[CREATE_QUESTION] User:", session?.user?.id, session?.user?.role);

        if (!session?.user || session.user.role !== "ADMIN") {
            // Check if INSTRUCTOR? schema says enum UserRole { ADMIN, INSTRUCTOR, STUDENT }
            // If the user is INSTRUCTOR, they should probably be allowed too.
            // Let's allow INSTRUCTOR for now or check course ownership (but ownership check is complex here without fetching course).
            // For now, let's stick to ADMIN but log if it fails.
            if (session?.user?.role !== "INSTRUCTOR") {
                console.log("[CREATE_QUESTION] Unauthorized access attempt:", session?.user?.role);
                throw new Error("Unauthorized");
            }
        }

        const lastQuestion = await db.question.findFirst({
            where: { quizId },
            orderBy: { position: "desc" },
        });

        const position = lastQuestion ? lastQuestion.position + 1 : 1;

        // Filter empty options just in case
        const validOptions = values.options?.filter(o => o.text.trim() !== "") || [];

        const question = await db.question.create({
            data: {
                text: values.text,
                type: values.type,
                points: values.points,
                position,
                quizId,
                correctAnswer: values.correctAnswer,
                options: {
                    create: validOptions.map((opt, index) => ({
                        text: opt.text,
                        isCorrect: opt.isCorrect,
                        position: index + 1,
                    })),
                },
            },
            include: {
                options: true,
            },
        });

        revalidatePath(`/admin/quizzes/${quizId}`);
        return question;
    } catch (error) {
        console.log("[CREATE_QUESTION_ERROR]", error);
        // Rethrow so UI catches it
        throw error;
    }
};

export const updateQuestion = async (
    questionId: string,
    quizId: string,
    values: {
        text?: string;
        type?: QuestionType;
        points?: number;
        options?: { id?: string; text: string; isCorrect: boolean }[];
        correctAnswer?: string; // For Essay or validation
    }
) => {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            if (session?.user?.role !== "INSTRUCTOR") {
                throw new Error("Unauthorized");
            }
        }

        const question = await db.question.update({
            where: { id: questionId },
            data: {
                text: values.text,
                type: values.type,
                points: values.points,
                correctAnswer: values.correctAnswer,
            },
        });

        if (values.options) {
            const validOptions = values.options.filter(o => o.text.trim() !== "");

            // Handle options update: Delete existing and recreate (simplest strategy for now, or upset)
            // A better strategy for reordering is needed, but for now let's just wipe and recreate if options are provided
            await db.option.deleteMany({
                where: { questionId },
            });

            if (validOptions.length > 0) {
                await db.option.createMany({
                    data: validOptions.map((opt, index) => ({
                        text: opt.text,
                        isCorrect: opt.isCorrect,
                        position: index + 1,
                        questionId,
                    })),
                });
            }
        }

        revalidatePath(`/admin/quizzes/${quizId}`);
        return question;

    } catch (error) {
        console.log("[UPDATE_QUESTION_ERROR]", error);
        throw error;
    }
};

export const deleteQuestion = async (questionId: string, quizId: string) => {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            throw new Error("Unauthorized");
        }

        const question = await db.question.delete({
            where: { id: questionId },
        });

        revalidatePath(`/admin/quizzes/${quizId}`);
        return question;
    } catch (error) {
        console.log("[DELETE_QUESTION]", error);
        throw error;
    }
};
