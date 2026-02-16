import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Navbar } from "@/components/shared/navbar";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";

const CourseLayout = async ({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ courseId: string }>;
}) => {
    const session = await auth();
    const resolvedParams = await params;
    const courseId = resolvedParams?.courseId;

    if (!courseId) {
        return redirect("/");
    }

    const userId = session?.user?.id;
    const isAdmin = session?.user?.role === "ADMIN";

    const course = await db.course.findUnique({
        where: { id: courseId },
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
            },
        }
    });

    if (!course) return redirect("/");

    // Access Check: Admin/Instructor, Direct Purchase, or Group Enrollment

    let hasAccess = false;
    let isPending = false;

    if (userId) {
        const purchase = await db.purchase.findUnique({
            where: {
                userId_courseId: {
                    userId,
                    courseId
                }
            }
        });

        if (purchase) {
            hasAccess = purchase.status === "COMPLETED" || isAdmin;
            isPending = purchase.status === "PENDING";
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

    const userProgress = userId ? await db.userProgress.findMany({
        where: {
            userId,
            topic: {
                lesson: {
                    courseId
                }
            }
        }
    }) : [];

    const completedTopicIds = new Set(userProgress.filter(p => p.isCompleted).map(p => p.topicId));
    const totalTopicsCount = course.lessons.reduce((acc, lesson) => acc + lesson.topics.length, 0);
    const completedTopicsCount = completedTopicIds.size;
    const progressPercentage = totalTopicsCount > 0 ? (completedTopicsCount / totalTopicsCount) * 100 : 0;

    // Redirect to first lesson if user has access and is at the root course path
    // We check if the children are actually on a landing page by looking if we have access
    // But since the layout wrap children, we need a way to detect if we are on the base path.
    // However, on the server-side layout, we don't have the path easily without headers.
    // Instead, we can rely on the fact that the CoursePage itself now handles the redirect.
    // So we just need to ensure the layout doesn't block it.

    // If they HAVE access, show the player shell in a fixed container to hide global Navbar/Footer
    return (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col overflow-hidden">
            {/* Top Bar */}
            <div className="h-[80px] md:pl-80 fixed inset-y-0 w-full z-50">
                <div className="p-4 border-b h-full flex items-center justify-between bg-white shadow-sm font-sans">
                    <div className="flex items-center gap-x-4">
                        <Link
                            href="/courses"
                            className="flex items-center gap-x-2 text-sm text-slate-500 hover:text-slate-900 transition-all font-medium"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Back to courses
                        </Link>
                        <div className="h-4 w-[1px] bg-slate-200" />
                        <div className="font-bold text-lg truncate text-slate-800">{course.title}</div>
                    </div>

                    <div className="flex items-center gap-x-4 px-4">
                        <div className="hidden sm:flex flex-col items-end gap-y-1">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">
                                {Math.round(progressPercentage)}% Complete
                            </span>
                            <Progress
                                value={progressPercentage}
                                className="h-1.5 w-32 bg-slate-100 [&>div]:bg-indigo-600"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar */}
            <div className="hidden md:flex h-full w-80 flex-col fixed inset-y-0 z-50">
                <div className="flex flex-col h-full border-r bg-slate-50 overflow-y-auto">
                    <div className="p-4">
                        {session?.user?.role === "STUDENT" && (
                            <Link
                                href="/student"
                                className="flex items-center gap-x-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-all mb-8 px-2 group"
                            >
                                <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                                Back to Dashboard
                            </Link>
                        )}
                        <h2 className="font-semibold text-sm uppercase text-slate-500 mb-6 px-2">Course Content</h2>
                        <div className="space-y-6">
                            {course.lessons.map(lesson => (
                                <div key={lesson.id} className="space-y-2">
                                    <p className="font-bold text-slate-900 text-sm px-2">{lesson.title}</p>
                                    <div className="space-y-1">
                                        {lesson.topics.map(topic => (
                                            <Link
                                                key={topic.id}
                                                href={`/courses/${course.id}/topics/${topic.id}`}
                                                className="flex items-center gap-3 text-sm text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-all py-2 px-3 rounded-xl truncate group"
                                            >
                                                <div className="min-w-[1.25rem] flex justify-center">
                                                    {completedTopicIds.has(topic.id) ? (
                                                        <span className="text-green-600">✅</span>
                                                    ) : (
                                                        topic.type === "QUIZ" ? "❓" : "📄"
                                                    )}
                                                </div>
                                                <span className="truncate group-hover:font-medium transition-all">{topic.title}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <main className="md:pl-80 pt-[80px] h-full overflow-y-auto bg-white">
                {children}
            </main>
        </div>
    );
};

export default CourseLayout;
