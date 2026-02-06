import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
// import { getProgress } from "@/actions/get-progress"; // If exists
import { Navbar } from "@/components/shared/navbar";

const CourseLayout = async ({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ courseId: string }>;
}) => {
    const session = await auth();
    const resolvedParams = await params;

    /* 
    // Ideally check purchase/enrollment here.
    const userId = session?.user?.id;
    if (!userId) return redirect("/");
    */

    const course = await db.course.findUnique({
        where: { id: resolvedParams.courseId },
        include: {
            lessons: {
                where: { isPublished: true },
                include: {
                    topics: {
                        where: { isPublished: true },
                        orderBy: { position: "asc" }
                    }
                },
                orderBy: { position: "asc" }
            }
        }
    });

    if (!course) return redirect("/");

    return (
        <div className="h-full">
            <div className="h-[80px] md:pl-80 fixed inset-y-0 w-full z-50">
                {/* Topbar placeholder - We just reuse Navbar for now but usually specific player nav */}
                <div className="p-4 border-b h-full flex items-center bg-white shadow-sm">
                    <span className="font-bold text-lg">{course.title}</span>
                </div>
            </div>
            <div className="hidden md:flex h-full w-80 flex-col fixed inset-y-0 z-50">
                {/* Sidebar Placeholder */}
                <div className="flex flex-col h-full border-r bg-slate-50 overflow-y-auto pt-[80px]">
                    <div className="p-4">
                        <h2 className="font-semibold text-sm uppercase text-slate-500 mb-2">Course Content</h2>
                        <div className="space-y-4">
                            {course.lessons.map(lesson => (
                                <div key={lesson.id}>
                                    <p className="font-medium text-slate-800 text-sm mb-1">{lesson.title}</p>
                                    <div className="pl-2 space-y-1">
                                        {lesson.topics.map(topic => (
                                            <a
                                                key={topic.id}
                                                href={`/courses/${course.id}/topics/${topic.id}`}
                                                className="block text-sm text-slate-600 hover:text-indigo-600 transition-colors py-1 truncate"
                                            >
                                                {topic.title} {topic.type === "QUIZ" ? "(Quiz)" : ""}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <main className="md:pl-80 pt-[80px] h-full">
                {children}
            </main>
        </div>
    );
};

export default CourseLayout;
