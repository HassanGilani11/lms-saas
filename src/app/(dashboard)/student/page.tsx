import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, BookOpen } from "lucide-react";
import { getCoursesWithProgress } from "@/actions/get-courses";
import Link from "next/link";
import Image from "next/image";

const StudentDashboardPage = async () => {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        return redirect("/");
    }

    const courses = await getCoursesWithProgress();
    const enrolledCourses = courses.filter(course => course.isEnrolled);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-8 text-slate-800">My Learning</h1>

            {enrolledCourses.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
                        <BookOpen className="h-10 w-10 text-slate-400" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl font-bold text-slate-700">No courses yet</h2>
                        <p className="text-slate-500 max-w-xs">
                            You haven&apos;t enrolled in any courses yet. Explore our catalog to start learning!
                        </p>
                    </div>
                    <Link href="/courses">
                        <button className="px-6 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition">
                            Browse Catalog
                        </button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {enrolledCourses.map((course) => (
                        <Link href={`/courses/${course.id}`} key={course.id}>
                            <Card className="overflow-hidden hover:shadow-lg transition-all border-slate-200 group h-full flex flex-col">
                                <div className="h-40 bg-slate-100 relative overflow-hidden">
                                    {course.imageUrl ? (
                                        <Image
                                            src={course.imageUrl}
                                            alt={course.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-indigo-50">
                                            <BookOpen className="h-12 w-12 text-indigo-200" />
                                        </div>
                                    )}
                                </div>
                                <CardHeader className="pb-2">
                                    <div className="flex items-center gap-x-2 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
                                        {course.category?.name || "Uncategorized"}
                                    </div>
                                    <CardTitle className="text-lg text-slate-800 line-clamp-2 h-14 group-hover:text-indigo-600 transition-colors">
                                        {course.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="mt-auto">
                                    <div className="flex items-center gap-x-2 text-sm text-slate-500 mb-4">
                                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                                        <span>{course.lessons.length} {course.lessons.length === 1 ? "Module" : "Modules"}</span>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                                            <span>Progress</span>
                                            <span>{Math.round(course.progress || 0)}%</span>
                                        </div>
                                        <Progress value={course.progress || 0} className="h-2" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudentDashboardPage;
