"use server";

import { db } from "@/lib/db";

export const getGroupProgressReport = async (groupId: string) => {
    try {
        const group = await db.group.findUnique({
            where: { id: groupId },
            include: {
                users: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        userProgress: {
                            include: {
                                topic: {
                                    include: {
                                        lesson: true
                                    }
                                }
                            }
                        }
                    }
                },
                assignedCourses: {
                    include: {
                        course: {
                            include: {
                                lessons: {
                                    include: {
                                        topics: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!group) return null;

        const reportData = group.users.map(user => {
            const courseStats = group.assignedCourses.map(ac => {
                const course = ac.course;
                const totalTopics = course.lessons.reduce((acc, l) => acc + l.topics.length, 0);
                const completedTopics = user.userProgress.filter(p =>
                    p.isCompleted &&
                    course.lessons.some(l => l.id === p.topic.lessonId)
                ).length;

                return {
                    courseId: course.id,
                    courseTitle: course.title,
                    totalTopics,
                    completedTopics,
                    percentage: totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0
                };
            });

            const overallPercentage = courseStats.length > 0
                ? courseStats.reduce((acc, c) => acc + c.percentage, 0) / courseStats.length
                : 0;

            return {
                userId: user.id,
                userName: user.name,
                userEmail: user.email,
                courseStats,
                overallPercentage
            };
        });

        return {
            groupId: group.id,
            groupName: group.name,
            totalMembers: group.users.length,
            reportData
        };
    } catch (error) {
        console.error("[GET_GROUP_PROGRESS_REPORT]", error);
        return null;
    }
};
