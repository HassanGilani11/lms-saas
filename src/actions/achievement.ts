"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

/**
 * Check and unlock achievements for a user based on context.
 * context can be { type: 'course_completion', courseId: string } etc.
 */
export const checkAchievements = async (userId: string, context?: any) => {
    try {
        console.log("Checking achievements for", userId, context);

        // 1. Fetch user stats
        const completedCourses = await db.userProgress.count({
            where: {
                userId,
                isCompleted: true, // Assuming this tracks lessons, need course level logic
            }
        });
        // Note: UserProgress is topic levle. Course completion is derived.
        // Let's count certificates for course completions.
        const certificatesCount = await db.certificate.count({
            where: { userId }
        });

        const newAchievements = [];

        // 2. Define Achievement Logic (Hardcoded examples for now, ideally driven by DB rules)

        // "First Step" - Complete 1 Course
        if (certificatesCount >= 1) {
            await unlockAchievement(userId, "first_step", "First Step", "Completed your first course!");
        }

        // "Dedicated Learner" - Complete 5 Courses
        if (certificatesCount >= 5) {
            await unlockAchievement(userId, "dedicated_learner", "Dedicated Learner", "Completed 5 courses.");
        }

        // "Quiz Master" - Logic would need quiz scores. 
        // Leaving as placeholder.

    } catch (error) {
        console.error("[CHECK_ACHIEVEMENTS]", error);
    }
};

const unlockAchievement = async (userId: string, slug: string, title: string, description: string, xp = 10, icon = "trophy") => {
    try {
        // Find or create the achievement definition
        let achievement = await db.achievement.findUnique({
            where: { slug }
        });

        if (!achievement) {
            achievement = await db.achievement.create({
                data: {
                    slug,
                    title,
                    description,
                    xp,
                    icon
                }
            });
        }

        // Check if user already has it
        const existing = await db.userAchievement.findUnique({
            where: {
                userId_achievementId: {
                    userId,
                    achievementId: achievement.id
                }
            }
        });

        if (!existing) {
            await db.userAchievement.create({
                data: {
                    userId,
                    achievementId: achievement.id
                }
            });
            console.log(`Unlocked achievement ${slug} for user ${userId}`);
            return true;
        }
        return false;
    } catch (error) {
        console.log("[UNLOCK_ACHIEVEMENT_ERROR]", error);
        return false;
    }
}

export const getUserAchievements = async (userId: string) => {
    try {
        return await db.userAchievement.findMany({
            where: { userId },
            include: {
                achievement: true
            },
            orderBy: {
                unlockedAt: 'desc'
            }
        });
    } catch (error) {
        return [];
    }
}
