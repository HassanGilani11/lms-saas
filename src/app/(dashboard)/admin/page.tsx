
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Users, BookOpen, List, GraduationCap,
    MoreHorizontal, Globe, Monitor, Smartphone,
    Tablet, MapPin
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { getAdminDashboardStats, getAdminPerformanceData } from "@/actions/analytics";
import AdminDashboardCharts from "./_components/admin-dashboard-charts";

const AdminDashboardPage = async () => {
    const stats = await getAdminDashboardStats();
    const performance = await getAdminPerformanceData();

    // Formatting values with commas
    const formatValue = (val: number) => val.toLocaleString();

    const kpiCards = [
        { label: "Courses", value: formatValue(stats.courses), icon: BookOpen, color: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" },
        { label: "Categories", value: formatValue(stats.categories), icon: List, color: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400" },
        { label: "Instructors", value: formatValue(stats.instructors), icon: GraduationCap, color: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400" },
        { label: "Students", value: formatValue(stats.students), icon: Users, color: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" },
    ];

    return (
        <div className="space-y-8 font-sans animate-in fade-in duration-500">
            {/* Header Section */}
            <div>
                <h1 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">Welcome Client!</h1>
            </div>

            {/* KPI Cards */}
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

            {/* Main Chart Section */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <AdminDashboardCharts
                    months={performance.months}
                    users={performance.users}
                    projects={performance.projects}
                    status={performance.status}
                />

                {/* Traffic by Website */}
                <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
                    <CardHeader>
                        <CardTitle className="text-[13px] font-bold text-slate-900 dark:text-slate-100">Traffic by Website</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-2">
                        {[
                            { name: "Google", value: 80 },
                            { name: "YouTube", value: 65 },
                            { name: "Instagram", value: 45 },
                            { name: "Pinterest", value: 30 },
                            { name: "Facebook", value: 20 },
                            { name: "Twitter", value: 15 },
                        ].map((site, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400">
                                    <span>{site.name}</span>
                                    <div className="flex gap-x-1">
                                        {[1, 2, 3].map(b => (
                                            <div key={b} className={`h-1 w-4 rounded-full ${b <= (site.value / 25) ? "bg-slate-800 dark:bg-slate-100" : "bg-slate-200 dark:bg-slate-800"}`} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
                {/* Traffic by Device */}
                <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
                    <CardHeader>
                        <CardTitle className="text-[13px] font-bold text-slate-900 dark:text-slate-100">Traffic by Device</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[250px] pt-4">
                        <div className="flex items-end justify-between h-[200px] gap-x-4 px-4">
                            {[
                                { label: "Linux", value: "40%", height: "h-[40%]", color: "bg-blue-200" },
                                { label: "Mac", value: "80%", height: "h-[80%]", color: "bg-emerald-300" },
                                { label: "iOS", value: "60%", height: "h-[60%]", color: "bg-slate-900 dark:bg-slate-100" },
                                { label: "Windows", value: "90%", height: "h-[90%]", color: "bg-blue-400" },
                                { label: "Android", value: "50%", height: "h-[50%]", color: "bg-purple-300" },
                                { label: "Other", value: "70%", height: "h-[70%]", color: "bg-emerald-400" },
                            ].map((bar, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-y-3 group">
                                    <div className={`${bar.height} w-full rounded-lg ${bar.color} transition-all duration-500 hover:opacity-80 relative overflow-hidden`}>
                                        <div className="absolute top-2 left-0 right-0 text-[8px] text-center font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                            {bar.value}
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">{bar.label}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Traffic by Location */}
                <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
                    <CardHeader>
                        <CardTitle className="text-[13px] font-bold text-slate-900 dark:text-slate-100">Traffic by Location</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[250px] flex items-center justify-between px-6 pt-4">
                        <div className="h-40 w-40 relative rounded-full border-[15px] border-slate-100 dark:border-slate-800 flex items-center justify-center">
                            {/* Simple Pie Representation */}
                            <div className="absolute inset-0 rounded-full border-[15px] border-blue-400 border-r-transparent border-b-transparent rotate-45" />
                            <div className="absolute inset-0 rounded-full border-[15px] border-emerald-300 border-l-transparent border-t-transparent -rotate-12" />
                            <div className="absolute inset-0 rounded-full border-[15px] border-purple-300 border-l-transparent border-b-transparent rotate-[140deg]" />
                        </div>
                        <div className="space-y-4 pr-10">
                            {[
                                { label: "United States", value: "52.1%", color: "bg-slate-800 dark:bg-slate-100" },
                                { label: "Canada", value: "22.8%", color: "bg-blue-400" },
                                { label: "Mexico", value: "13.9%", color: "bg-emerald-300" },
                                { label: "Other", value: "11.2%", color: "bg-blue-200" },
                            ].map((loc, i) => (
                                <div key={i} className="flex items-center gap-x-8">
                                    <div className="flex items-center gap-x-2 w-28">
                                        <div className={`h-1.5 w-1.5 rounded-full ${loc.color}`} />
                                        <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">{loc.label}</span>
                                    </div>
                                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">{loc.value}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
