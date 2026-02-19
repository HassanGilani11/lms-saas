import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getStudentDashboardData } from "@/actions/student-dashboard";
import { DashboardHeader } from "./_components/dashboard-header";
import { StudentCourseList } from "./_components/student-course-list";
import { BookOpen, GraduationCap, Award, Zap } from "lucide-react";
import Link from "next/link";
import { CourseCard } from "@/components/course-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

const StudentDashboardPage = async () => {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        return redirect("/");
    }

    const { user, stats, courses } = await getStudentDashboardData();

    const kpiCards = [
        {
            label: "Enrolled Courses",
            value: stats.courses,
            icon: BookOpen,
            color: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
        },
        {
            label: "Completed",
            value: stats.completed,
            icon: GraduationCap,
            color: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
        },
        {
            label: "Certificates",
            value: stats.certificates,
            icon: Award,
            color: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
        },
        {
            label: "XP Points",
            value: stats.points,
            icon: Zap,
            color: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
        },
    ];

    return (
        <div className="py-4 space-y-8 animate-in fade-in duration-500">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">My Learning</h1>

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
                        <TabsTrigger value="overview" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm px-6 font-bold">
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="report" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm px-6 font-bold">
                            Learning Report
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="mt-0 outline-none space-y-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {kpiCards.map((stat, i) => (
                                <Card key={i} className="border-none shadow-sm bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm group hover:shadow-md transition-all duration-300">
                                    <CardContent className="p-6">
                                        <div className="flex flex-col space-y-3">
                                            <span className="text-[12px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</span>
                                            <div className="flex items-center justify-between">
                                                <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stat.value}</span>
                                                <div className={`${stat.color} p-2 rounded-xl group-hover:scale-110 transition-transform`}>
                                                    <stat.icon size={20} />
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

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
