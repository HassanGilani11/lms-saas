import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { QuizPlayer } from "@/components/quiz-player";
import { FileText, Lock, Video as VideoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CourseProgressButton } from "@/components/course-progress-button";

const TopicIdPage = async ({
    params
}: {
    params: Promise<{ courseId: string; topicId: string }>;
}) => {
    const { courseId, topicId } = await params;
    const session = await auth();
    const userId = session?.user?.id;

    // Check Access
    const isAdmin = session?.user?.role === "ADMIN";
    let hasAccess = false;

    if (userId) {
        const purchase = await db.purchase.findUnique({
            where: {
                userId_courseId: {
                    userId,
                    courseId,
                }
            }
        });
        if (purchase?.status === "COMPLETED" || isAdmin) {
            hasAccess = true;
        }

        if (!hasAccess && !isAdmin) {
            const userGroups = await db.group.findMany({
                where: {
                    users: { some: { id: userId } },
                    assignedCourses: { some: { courseId } }
                }
            });
            hasAccess = userGroups.length > 0;
        }
    }

    if (isAdmin) hasAccess = true;

    if (!hasAccess) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 bg-slate-50 min-h-screen">
                <div className="max-w-md w-full bg-white p-12 rounded-[3rem] shadow-xl border border-slate-100 text-center space-y-6">
                    <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto text-indigo-600">
                        <Lock className="h-10 w-10" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold text-slate-900">Access Restricted</h1>
                        <p className="text-slate-500 font-medium">Please enroll in this course to access the lessons and quizzes.</p>
                    </div>
                    <Button asChild size="lg" className="w-full bg-indigo-600 hover:bg-slate-900 rounded-2xl h-14 font-bold">
                        <Link href={`/courses/${courseId}`}>Go to Course Page</Link>
                    </Button>
                </div>
            </div>
        );
    }

    const topic = await db.topic.findUnique({
        where: { id: topicId },
        include: {
            quiz: true,
            lesson: {
                include: {
                    course: {
                        include: {
                            lessons: {
                                where: isAdmin ? {} : { isPublished: true },
                                include: {
                                    topics: {
                                        where: isAdmin ? {} : { isPublished: true },
                                        orderBy: { position: "asc" }
                                    }
                                },
                                orderBy: { position: "asc" }
                            }
                        }
                    }
                }
            }
        }
    });

    if (!topic) return <div>Topic not found</div>;

    const userProgress = userId ? await db.userProgress.findUnique({
        where: {
            userId_topicId: {
                userId,
                topicId,
            }
        }
    }) : null;

    const isCompleted = !!userProgress?.isCompleted;

    // Calculate Next Topic
    const allTopics = topic.lesson.course.lessons.flatMap(l => l.topics);
    const currentTopicIndex = allTopics.findIndex(t => t.id === topicId);
    const nextTopic = allTopics[currentTopicIndex + 1];

    if (topic.type === "QUIZ") {
        if (!topic.quizId && !topic.quiz) return <div>Quiz configuration missing</div>;

        return (
            <div className="h-full w-full bg-white overflow-y-auto">
                <div className="max-w-4xl mx-auto py-10 px-6 space-y-10">
                    <QuizPlayer
                        quizId={topic.quizId || topic.quiz?.id!}
                        userId={userId || ""}
                    />

                    <div className="flex justify-end pt-8 border-t">
                        <CourseProgressButton
                            courseId={courseId}
                            topicId={topicId}
                            nextTopicId={nextTopic?.id}
                            isCompleted={isCompleted}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full p-8 lg:p-12 overflow-y-auto">
            <div className="max-w-5xl mx-auto space-y-12 pb-20">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-indigo-600 font-bold uppercase tracking-widest text-xs">
                        {topic.type === "VIDEO" && <VideoIcon className="h-4 w-4" />}
                        {topic.type === "TEXT" && <FileText className="h-4 w-4" />}
                        {topic.type} Lesson
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight">
                        {topic.title}
                    </h1>
                </div>

                {topic.description && (
                    <p className="text-lg text-slate-500 leading-relaxed font-medium">
                        {topic.description}
                    </p>
                )}

                {topic.type === "VIDEO" && topic.videoUrl && (
                    <div className="w-full bg-slate-900 aspect-video rounded-3xl overflow-hidden shadow-2xl relative group">
                        <iframe
                            src={topic.videoUrl}
                            className="w-full h-full"
                            allowFullScreen
                        />
                    </div>
                )}

                {topic.type === "TEXT" && topic.content && (
                    <div
                        className="prose prose-indigo max-w-none text-slate-700 leading-loose text-lg bg-slate-50 p-8 lg:p-12 rounded-[2.5rem] border border-slate-100"
                        dangerouslySetInnerHTML={{ __html: topic.content }}
                    />
                )}

                <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-12 border-t">
                    <div className="space-y-1">
                        <h4 className="font-bold text-slate-900">Finish this lesson</h4>
                        <p className="text-sm text-slate-500 font-medium tracking-tight whitespace-nowrap">
                            Mark as completed to track your progress and unlock the next topic.
                        </p>
                    </div>
                    <CourseProgressButton
                        courseId={courseId}
                        topicId={topicId}
                        nextTopicId={nextTopic?.id}
                        isCompleted={isCompleted}
                    />
                </div>
            </div>
        </div>
    );
};

export default TopicIdPage;
