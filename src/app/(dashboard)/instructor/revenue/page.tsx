import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getInstructorRevenue } from "@/actions/analytics";
import { formatPrice } from "@/lib/format";
import { getSettings } from "@/actions/settings";
import { CoursePrice } from "@/components/course-price";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { DollarSign, TrendingUp, Users, Wallet } from "lucide-react";

const RevenuePage = async () => {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        return redirect("/auth/login");
    }

    const { totalRevenue, totalSales, revenueByCourse } = await getInstructorRevenue();
    const settings = await getSettings();
    const currency = settings?.stripeCurrency || "USD";

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
                    <Wallet className="h-8 w-8 text-indigo-600" />
                    Revenue Insights
                </h1>
                <p className="text-slate-500 font-medium tracking-tight">
                    Analyze your earnings and course performance.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="rounded-3xl border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 bg-slate-50/50">
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500">Total Earnings</CardTitle>
                        <DollarSign className="h-5 w-5 text-indigo-600" />
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="text-3xl font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            <CoursePrice price={totalRevenue} />
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-1">Lifetime revenue across all courses</p>
                    </CardContent>
                </Card>
                <Card className="rounded-3xl border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 bg-slate-50/50">
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500">Total Sales</CardTitle>
                        <Users className="h-5 w-5 text-indigo-600" />
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="text-3xl font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {totalSales}
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-1">Total individual enrollments</p>
                    </CardContent>
                </Card>
                <Card className="rounded-3xl border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-all md:col-span-2 lg:col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 bg-slate-50/50">
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500">Avg. Per Sale</CardTitle>
                        <TrendingUp className="h-5 w-5 text-indigo-600" />
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="text-3xl font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            <CoursePrice price={totalSales > 0 ? (totalRevenue / totalSales) : 0} />
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-1">Average revenue generated per student</p>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-900">Breakdown by Course</h2>
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    {revenueByCourse.length === 0 ? (
                        <div className="p-12 text-center text-slate-500 font-medium italic">
                            No revenue data available yet.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow>
                                    <TableHead className="font-bold py-4 pl-6 text-slate-700">Course Title</TableHead>
                                    <TableHead className="font-bold py-4 text-slate-700">Contribution</TableHead>
                                    <TableHead className="font-bold py-4 text-right pr-6 text-slate-700">Earnings</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {revenueByCourse.map((course, idx) => (
                                    <TableRow key={idx} className="group hover:bg-slate-50/50 transition-colors">
                                        <TableCell className="py-5 pl-6 font-bold text-slate-900">{course.title}</TableCell>
                                        <TableCell className="py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                                    <div
                                                        className="bg-indigo-600 h-full rounded-full"
                                                        style={{ width: `${(course.amount / totalRevenue) * 100}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-bold text-slate-500 shrink-0">
                                                    {((course.amount / totalRevenue) * 100).toFixed(1)}%
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-5 text-right pr-6 font-extrabold text-indigo-600">
                                            <CoursePrice price={course.amount} />
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
