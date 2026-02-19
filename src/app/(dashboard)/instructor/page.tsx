import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle, Users, BookOpen, CircleDollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getInstructorDashboardStats, getInstructorAnalytics } from "@/actions/analytics";
import { formatPrice } from "@/lib/format";
import { BarChart, HeatmapMock } from "@/components/shared/charts";

const InstructorDashboardPage = async () => {
    const [stats, analytics] = await Promise.all([
        getInstructorDashboardStats(),
        getInstructorAnalytics()
    ]);

    const kpiCards = [
        {
            label: "Total Students",
            value: stats.students.toLocaleString(),
            icon: Users,
            color: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
        },
        {
            label: "Active Courses",
            value: stats.courses.toLocaleString(),
            icon: BookOpen,
            color: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
        },
        {
            label: "Total Revenue",
            value: formatPrice(stats.revenue),
            icon: CircleDollarSign,
            color: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
        },
    ];

    return (
        <div className="space-y-8 font-sans animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">Welcome Back, Instructor</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Manage your courses and track student performance.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="border-none shadow-sm bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-8">
                    <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">Enrollment Trends</h3>
                    <div className="h-[200px] w-full">
                        <BarChart data={analytics.enrollmentTrends} />
                    </div>
                </Card>

                <Card className="border-none shadow-sm bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-8">
                    <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">Course Performance</h3>
                    <div className="h-[200px] w-full overflow-y-auto pr-2 custom-scrollbar">
                        <HeatmapMock data={analytics.courseEngagement} />
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default InstructorDashboardPage;
