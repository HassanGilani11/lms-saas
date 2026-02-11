"use client";

import { useEffect, useState } from "react";
import {
    getCourseCompletionRates,
    getQuizPerformanceAnalytics,
    getTimeSpentAnalytics,
    getGroupLevelAnalytics
} from "@/actions/analytics";
import { exportToCSV, downloadCSV } from "@/lib/export-utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
    BarChart,
    CheckCircle2,
    Users,
    Clock,
    Download,
    Loader2,
    TrendingUp,
    CheckSquare,
    Target
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";


const ReportPage = () => {
    const [completionData, setCompletionData] = useState<any[]>([]);
    const [quizData, setQuizData] = useState<any[]>([]);
    const [timeData, setTimeData] = useState<any[]>([]);
    const [groupData, setGroupData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [completion, quizzes, time, groups] = await Promise.all([
                getCourseCompletionRates(),
                getQuizPerformanceAnalytics(),
                getTimeSpentAnalytics(),
                getGroupLevelAnalytics()
            ]);
            setCompletionData(completion);
            setQuizData(quizzes);
            setTimeData(time);
            setGroupData(groups);
        } catch (error) {
            toast.error("Failed to load analytics data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleExport = (data: any[], filename: string) => {
        const csv = exportToCSV(data, filename);
        downloadCSV(csv, filename);
        toast.success("Report exported successfully");
    };

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8 font-sans text-black">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">System Reports & Analytics</h1>
                    <p className="text-slate-500 mt-1">Monitor course performance, student engagement, and group activities.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={fetchData}>
                        Refresh Data
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="courses" className="space-y-6">
                <TabsList className="bg-slate-100 p-1 rounded-xl h-auto flex flex-wrap gap-1">
                    <TabsTrigger value="courses" className="rounded-lg px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Course Completion
                    </TabsTrigger>
                    <TabsTrigger value="quizzes" className="rounded-lg px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <CheckSquare className="h-4 w-4 mr-2" />
                        Quiz Performance
                    </TabsTrigger>
                    <TabsTrigger value="time" className="rounded-lg px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <Clock className="h-4 w-4 mr-2" />
                        Time Tracking
                    </TabsTrigger>
                    <TabsTrigger value="groups" className="rounded-lg px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <Users className="h-4 w-4 mr-2" />
                        Group Analytics
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="courses" className="space-y-6">
                    <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-x-2 text-slate-600">
                            <TrendingUp className="h-5 w-5 text-emerald-500" />
                            <span className="font-semibold">Course Engagement Report</span>
                        </div>
                        <Button variant="ghost" size="sm" className="text-blue-600 h-8" onClick={() => handleExport(completionData, "course_completion_report")}>
                            <Download className="h-4 w-4 mr-2" />
                            Export Data
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {completionData.map((course) => (
                            <Card key={course.id} className="border-none shadow-sm hover:shadow-md transition-shadow">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-lg font-bold truncate pr-2">{course.title}</CardTitle>
                                        <div className="bg-slate-100 px-2 py-1 rounded text-[10px] font-bold text-slate-500">
                                            {course.studentCount} ENROLLED
                                        </div>
                                    </div>
                                    <CardDescription>Average Completion Rate</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-2xl font-bold text-slate-900">{course.completionRate}%</span>
                                            <div className={cn(
                                                "h-2 w-2 rounded-full",
                                                course.completionRate > 70 ? "bg-emerald-500" : course.completionRate > 30 ? "bg-amber-500" : "bg-red-500"
                                            )} />
                                        </div>
                                        <Progress value={course.completionRate} className="h-2" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="quizzes" className="space-y-6">
                    <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-x-2 text-slate-600">
                            <Target className="h-5 w-5 text-indigo-500" />
                            <span className="font-semibold">Performance Assessment Analytics</span>
                        </div>
                        <Button variant="ghost" size="sm" className="text-blue-600 h-8" onClick={() => handleExport(quizData, "quiz_performance_report")}>
                            <Download className="h-4 w-4 mr-2" />
                            Export Data
                        </Button>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Quiz Title</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Course</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Avg. Score</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Pass Rate</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Attempts</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {quizData.map((quiz) => (
                                    <tr key={quiz.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-slate-900">{quiz.title}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500">{quiz.course}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-x-2">
                                                <span className="font-bold">{quiz.avgScore}%</span>
                                                <div className="w-16 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-indigo-500" style={{ width: `${quiz.avgScore}%` }} />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-x-2">
                                                <span className="font-bold">{quiz.passRate}%</span>
                                                <div className="w-16 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-emerald-500" style={{ width: `${quiz.passRate}%` }} />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="bg-slate-100 px-3 py-1 rounded-full text-xs font-bold text-slate-600">
                                                {quiz.totalAttempts}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {quizData.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                            No quiz attempts recorded yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </TabsContent>

                <TabsContent value="time" className="space-y-6">
                    <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-x-2 text-slate-600">
                            <Clock className="h-5 w-5 text-sky-500" />
                            <span className="font-semibold">User Activity & Time Allocation</span>
                        </div>
                        <Button variant="ghost" size="sm" className="text-blue-600 h-8" onClick={() => handleExport(timeData, "time_spent_report")}>
                            <Download className="h-4 w-4 mr-2" />
                            Export Data
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {timeData.map((course) => (
                            <div key={course.courseId} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group flex flex-col items-center text-center">
                                <div className="h-12 w-12 bg-sky-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Clock className="h-6 w-6 text-sky-500" />
                                </div>
                                <h3 className="font-bold text-slate-900 truncate w-full mb-1">{course.title}</h3>
                                <div className="text-3xl font-black text-slate-900 mb-1">{course.totalMinutes}</div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Minutes Spent</div>
                            </div>
                        ))}
                        {timeData.length === 0 && (
                            <div className="col-span-full py-20 bg-slate-50 border border-dashed rounded-2xl flex flex-col items-center justify-center text-slate-400 text-sm">
                                <Clock className="h-10 w-10 mb-2 opacity-20" />
                                No activity logs recorded yet.
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="groups" className="space-y-6">
                    <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-x-2 text-slate-600">
                            <Users className="h-5 w-5 text-amber-500" />
                            <span className="font-semibold">Group-Level Performance Overview</span>
                        </div>
                        <Button variant="ghost" size="sm" className="text-blue-600 h-8" onClick={() => handleExport(groupData, "group_analytics_report")}>
                            <Download className="h-4 w-4 mr-2" />
                            Export Data
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {groupData.map((group) => (
                            <div key={group.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                <div className="flex border-b border-slate-50 pb-4 mb-4 justify-between items-center">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900">{group.name}</h3>
                                        <div className="text-xs font-medium text-slate-400">{group.userCount} Members</div>
                                    </div>
                                    <div className="h-10 w-10 bg-slate-50 rounded-lg flex items-center justify-center">
                                        <Users className="h-5 w-5 text-slate-400" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-amber-50/50 p-4 rounded-xl">
                                        <div className="text-2xl font-black text-amber-700">{group.avgQuizScore}%</div>
                                        <div className="text-[10px] font-bold text-amber-600/70 uppercase">Avg. Quiz Score</div>
                                    </div>
                                    <div className="bg-indigo-50/50 p-4 rounded-xl">
                                        <div className="text-2xl font-black text-indigo-700">{group.totalAchievements}</div>
                                        <div className="text-[10px] font-bold text-indigo-600/70 uppercase">Total Badges</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {groupData.length === 0 && (
                            <div className="col-span-full py-20 bg-slate-50 border border-dashed rounded-2xl flex flex-col items-center justify-center text-slate-400 text-sm">
                                No groups registered in the system.
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default ReportPage;

