import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getMyOrders } from "@/actions/analytics";
import { formatPrice } from "@/lib/format";
import { getSettings } from "@/actions/settings";
import { CoursePrice } from "@/components/course-price";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Download, ExternalLink, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

const OrdersPage = async () => {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        return redirect("/auth/login");
    }

    const orders = await getMyOrders();
    const settings = await getSettings();

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
                    <ShoppingBag className="h-8 w-8 text-indigo-600" />
                    My Orders
                </h1>
                <p className="text-slate-500 font-medium tracking-tight">
                    Manage your course purchases and access receipts.
                </p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                {orders.length === 0 ? (
                    <div className="p-20 text-center space-y-6">
                        <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                            <ShoppingBag className="h-10 w-10 text-slate-400" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-xl font-bold text-slate-900">No orders yet</h2>
                            <p className="text-slate-500 max-w-xs mx-auto">You haven't purchased any courses yet. Explore our catalog to find your next goal!</p>
                        </div>
                        <Link href="/courses">
                            <Badge className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-slate-900 cursor-pointer transition-all">
                                Browse Courses
                            </Badge>
                        </Link>
                    </div>
                ) : (
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead className="font-bold py-4 pl-6 text-slate-700">Course</TableHead>
                                <TableHead className="font-bold py-4 text-slate-700">Date</TableHead>
                                <TableHead className="font-bold py-4 text-slate-700">Amount</TableHead>
                                <TableHead className="font-bold py-4 text-slate-700">Status</TableHead>
                                <TableHead className="font-bold py-4 text-slate-700">Type</TableHead>
                                <TableHead className="font-bold py-4 text-right pr-6 text-slate-700">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.map((order) => (
                                <TableRow key={order.id} className="group hover:bg-slate-50/50 transition-colors">
                                    <TableCell className="py-5 pl-6">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-20 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                                                {order.course.imageUrl ? (
                                                    <img src={order.course.imageUrl} alt={order.course.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <ShoppingBag className="h-5 w-5 text-slate-300" />
                                                    </div>
                                                )}
                                            </div>
                                            <span className="font-bold text-slate-900 line-clamp-1">{order.course.title}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-5 text-slate-600 font-medium">
                                        {format(new Date(order.createdAt), "MMM dd, yyyy")}
                                    </TableCell>
                                    <TableCell className="py-5 font-bold text-slate-900">
                                        <CoursePrice price={order.amount || 0} />
                                    </TableCell>
                                    <TableCell className="py-5">
                                        <Badge
                                            variant={order.status === "COMPLETED" ? "default" : "outline"}
                                            className={
                                                order.status === "COMPLETED"
                                                    ? "bg-emerald-100 text-emerald-700 border-emerald-200 font-bold hover:bg-emerald-100"
                                                    : order.status === "PENDING"
                                                        ? "bg-amber-100 text-amber-700 border-amber-200 font-bold hover:bg-amber-100"
                                                        : "bg-rose-100 text-rose-700 border-rose-200 font-bold hover:bg-rose-100"
                                            }
                                        >
                                            {order.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="py-5">
                                        <div className="flex items-center gap-2 text-slate-500 font-medium">
                                            {order.type === "STRIPE" && <CreditCard className="h-3 w-3" />}
                                            <span className="text-xs uppercase tracking-wider font-bold">{order.type}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-5 text-right pr-6">
                                        <div className="flex items-center justify-end gap-2">
                                            {order.receiptUrl && (
                                                <Link
                                                    href={order.receiptUrl}
                                                    target="_blank"
                                                    className="p-2 rounded-lg border border-slate-200 hover:bg-white hover:text-indigo-600 transition-all shadow-sm"
                                                    title="View Receipt"
                                                >
                                                    <Download className="h-4 w-4" />
                                                </Link>
                                            )}
                                            <Link
                                                href={`/courses/${order.courseId}`}
                                                className="p-2 rounded-lg border border-slate-200 hover:bg-white hover:text-indigo-600 transition-all shadow-sm"
                                                title="View Course"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                            </Link>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    );
};

export default OrdersPage;
