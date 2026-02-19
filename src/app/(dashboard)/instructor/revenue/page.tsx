import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getInstructorRevenue } from "@/actions/analytics";
import { CoursePrice } from "@/components/course-price";
import {
    Card,
    CardContent
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Wallet, Users, TrendingUp, BarChart3 } from "lucide-react";

const RevenuePage = async () => {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        return redirect("/auth/login");
    }

    const { totalRevenue, totalSales, revenueByCourse } = await getInstructorRevenue();

    const kpiCards = [
        {
            label: "Total Earnings",
            value: totalRevenue,
            isPrice: true,
            icon: Wallet,
            description: "Lifetime revenue across all courses",
            color: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
        },
        {
            label: "Total Sales",
            value: totalSales,
            isPrice: false,
            icon: Users,
            description: "Total individual enrollments",
            color: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
        },
        {
            label: "Avg. Per Sale",
            value: totalSales > 0 ? (totalRevenue / totalSales) : 0,
            isPrice: true,
            icon: TrendingUp,
            description: "Average revenue generated per student",
            color: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
        },
    ];

    return (
        <div className="space-y-8 font-sans animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
                    <BarChart3 className="h-6 w-6 text-slate-900 dark:text-slate-100" />
                    Revenue Insights
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Analyze your earnings and course performance across your entire catalog.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {kpiCards.map((stat, i) => (
                    <Card key={i} className="border-none shadow-sm bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm group hover:shadow-md transition-all duration-300">
                        <CardContent className="p-6">
                            <div className="flex flex-col space-y-3">
                                <span className="text-[12px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</span>
                                <div className="flex items-center justify-between">
                                    <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                        {stat.isPrice ? <CoursePrice price={stat.value as number} /> : stat.value}
                                    </span>
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

            <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Breakdown by Course</h2>
                <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                    {revenueByCourse.length === 0 ? (
                        <div className="p-12 text-center text-slate-500 dark:text-slate-400 font-medium italic">
                            No courses or revenue data available yet.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
                                <TableRow className="border-slate-100 dark:border-slate-800 hover:bg-transparent">
                                    <TableHead className="font-bold py-4 pl-6 text-slate-700 dark:text-slate-300">Course Title</TableHead>
                                    <TableHead className="font-bold py-4 text-slate-700 dark:text-slate-300">Sales</TableHead>
                                    <TableHead className="font-bold py-4 text-slate-700 dark:text-slate-300">Contribution</TableHead>
                                    <TableHead className="font-bold py-4 text-right pr-6 text-slate-700 dark:text-slate-300">Earnings</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {revenueByCourse.map((course, idx) => (
                                    <TableRow key={idx} className="group border-slate-100 dark:border-slate-800 hover:bg-slate-50/30 dark:hover:hover:bg-slate-800/30 transition-colors">
                                        <TableCell className="py-5 pl-6 font-bold text-slate-900 dark:text-slate-100">{course.title}</TableCell>
                                        <TableCell className="py-5">
                                            <span className="text-[12px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                                                {course.sales}
                                            </span>
                                        </TableCell>
                                        <TableCell className="py-5">
                                            <div className="flex items-center gap-4 max-w-[200px]">
                                                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                                    <div
                                                        className="bg-indigo-500 dark:bg-indigo-400 h-full rounded-full transition-all duration-500"
                                                        style={{ width: `${totalRevenue > 0 ? (course.amount / totalRevenue) * 100 : 0}%` }}
                                                    />
                                                </div>
                                                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 shrink-0">
                                                    {totalRevenue > 0 ? ((course.amount / totalRevenue) * 100).toFixed(1) : "0.0"}%
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-5 text-right pr-6 font-bold text-slate-900 dark:text-slate-100">
                                            {course.amount > 0 ? (
                                                <CoursePrice price={course.amount} />
                                            ) : (
                                                <span className="text-slate-400 dark:text-slate-500 font-medium">Free / 0.00</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RevenuePage;
