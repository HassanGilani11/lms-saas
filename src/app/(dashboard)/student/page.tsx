import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getStudentDashboardData } from "@/actions/student-dashboard";
import { DashboardHeader } from "./_components/dashboard-header";
import { StudentCourseList } from "./_components/student-course-list";
import { BookOpen } from "lucide-react";
import Link from "next/link";
import { CourseCard } from "@/components/course-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const StudentDashboardPage = async () => {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        return redirect("/");
    }

    const { user, stats, courses } = await getStudentDashboardData();

    return (
        <div className="py-4 space-y-6">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">My Learning</h1>

            {courses.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                        <BookOpen className="h-10 w-10 text-slate-400 dark:text-slate-500" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200">No courses yet</h2>
                        <p className="text-slate-500 dark:text-slate-400 max-w-xs">
                            You haven&apos;t enrolled in any courses yet. Explore our catalog to start learning!
                        </p>
                    </div>
                    <Link href="/courses">
                        <button className="px-6 py-2 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-200 transition">
                            Browse Catalog
                        </button>
                    </Link>
                </div>
            ) : (
                <Tabs defaultValue="overview" className="space-y-8">
                    <TabsList className="bg-slate-100/50 dark:bg-slate-900/50 p-1 border dark:border-slate-800">
                        <TabsTrigger value="overview" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm px-6">
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="report" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm px-6">
                            Learning Report
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="mt-0 outline-none">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {courses.map((course) => (
                                <CourseCard
                                    key={course.id}
                                    id={course.id}
                                    title={course.title}
                                    description={course.description}
                                    imageUrl={course.imageUrl}
                                    lessonsCount={course.lessonsCount}
                                    progress={course.progress}
                                    category={course.category}
                                    price={course.price}
                                    isEnrolled={course.isEnrolled}
                                    lastActivity={course.lastActivity}
                                />
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="report" className="mt-0 outline-none space-y-12">
                        <DashboardHeader
                            user={user}
                            stats={stats}
                        />
                        <StudentCourseList courses={courses} />
                    </TabsContent>
                </Tabs>
            )}
        </div>
    );
};

export default StudentDashboardPage;
