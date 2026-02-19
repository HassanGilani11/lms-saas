import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getInstructorAnalytics } from "@/actions/analytics";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Users, BookOpen, Clock, Activity } from "lucide-react";
import { BarChart, HeatmapMock } from "@/components/shared/charts";

const InstructorAnalyticsPage = async () => {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        return redirect("/auth/login");
    }

    const stats = await getInstructorAnalytics();

    const kpiCards = [
        {
            label: "Total Enrollment",
            value: stats.totalEnrollments,
            unit: "students",
            icon: Users,
            description: "Total students across all courses",
            color: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
        },
        {
            label: "Completion Rate",
            value: stats.avgCompletionRate,
            unit: "%",
            icon: TrendingUp,
            description: "Average student progress",
            color: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
        },
        {
            label: "Active Courses",
            value: stats.activeCourses,
            unit: "courses",
            icon: BookOpen,
            description: "Currently published courses",
            color: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
        },
        {
            label: "Avg. Watch Time",
            value: stats.avgWatchTime,
            unit: "min",
            icon: Clock,
            description: "Total engagement per lesson",
            color: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
        },
    ];

    return (
        <div className="space-y-8 font-sans animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
                    <Activity className="h-6 w-6 text-slate-900 dark:text-slate-100" />
                    Course Analytics
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Track student engagement and enrollment performance.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpiCards.map((stat, i) => (
                    <Card key={i} className="border-none shadow-sm bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm group hover:shadow-md transition-all duration-300">
                        <CardContent className="p-6">
                            <div className="flex flex-col space-y-3">
                                <span className="text-[12px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</span>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stat.value}</span>
                                        <span className="text-xs font-bold text-slate-400">{stat.unit}</span>
                                    </div>
                                    <div className={`${stat.color} p-2 rounded-xl group-hover:scale-110 transition-transform`}>
                                        <stat.icon size={20} />
                                    </div>
                                </div>
                                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                                    {stat.description}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="border-none shadow-sm bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-8">
                    <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">Enrollment Trends</h3>
                    <div className="h-[200px] w-full">
                        <BarChart data={stats.enrollmentTrends} />
                    </div>
                </Card>

                <Card className="border-none shadow-sm bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-8">
                    <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">Course Engagement</h3>
                    <div className="h-[200px] w-full overflow-y-auto pr-2 custom-scrollbar">
                        <HeatmapMock data={stats.courseEngagement} />
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default InstructorAnalyticsPage;
