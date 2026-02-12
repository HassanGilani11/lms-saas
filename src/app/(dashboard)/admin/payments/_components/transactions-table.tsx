"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
    MoreVertical,
    CheckCircle,
    XCircle,
    Loader2,
    Calendar,
    Search,
    Filter,
    ArrowUpDown
} from "lucide-react";
import { toast } from "react-hot-toast";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

import { approvePurchase, rejectPurchase } from "@/actions/purchase";

interface TransactionsTableProps {
    data: any[];
}

export const TransactionsTable = ({
    data
}: TransactionsTableProps) => {
    const [isLoading, setIsLoading] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const onApprove = async (id: string) => {
        try {
            setIsLoading(id);
            const result = await approvePurchase(id);
            if (result.success) {
                toast.success("Enrollment approved");
                // The page will revalidate and update the data
            } else {
                toast.error(result.error || "Failed to approve");
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setIsLoading(null);
        }
    };

    const onReject = async (id: string) => {
        if (!confirm("Are you sure you want to reject this enrollment? This will delete the purchase record.")) {
            return;
        }

        try {
            setIsLoading(id);
            const result = await rejectPurchase(id);
            if (result.success) {
                toast.success("Enrollment rejected");
            } else {
                toast.error(result.error || "Failed to reject");
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setIsLoading(null);
        }
    };

    const filteredData = data.filter((item) => {
        const searchStr = searchQuery.toLowerCase();
        return (
            item.user?.name?.toLowerCase().includes(searchStr) ||
            item.user?.email?.toLowerCase().includes(searchStr) ||
            item.course?.title?.toLowerCase().includes(searchStr)
        );
    });

    return (
        <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-white px-6 py-4 border-b">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-x-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900">
                            <Filter className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900">
                            <ArrowUpDown className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="relative group">
                        <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-600 transition-colors" />
                        <Input
                            placeholder="Search transactions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-8 w-64 pl-9 bg-slate-50 border-none text-[13px] focus-visible:ring-1 focus-visible:ring-slate-200"
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                            <TableHead className="w-[100px] text-[11px] font-bold text-slate-400 uppercase tracking-tighter pl-6">ID#</TableHead>
                            <TableHead className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">Student</TableHead>
                            <TableHead className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">Course</TableHead>
                            <TableHead className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">Amount</TableHead>
                            <TableHead className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">Date</TableHead>
                            <TableHead className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">Method</TableHead>
                            <TableHead className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">Status</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center text-slate-500 text-[13px]">
                                    No transactions found.
                                </TableCell>
                            </TableRow>
                        )}
                        {filteredData.map((purchase, idx) => (
                            <TableRow key={purchase.id} className="group hover:bg-slate-50/50 border-b last:border-0">
                                <TableCell className="text-[12px] font-medium text-slate-500 pl-6">
                                    #{purchase.id.substring(0, 8).toUpperCase()}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-x-3">
                                        <Avatar className="h-7 w-7 border">
                                            <AvatarImage src={purchase.user?.image || ""} />
                                            <AvatarFallback className="text-[10px] bg-slate-100 font-bold">
                                                {purchase.user?.name?.[0] || "?"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="text-[12px] font-medium text-slate-700">{purchase.user?.name || "N/A"}</span>
                                            <span className="text-[10px] text-slate-400">{purchase.user?.email}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="text-[12px] text-slate-600 font-medium line-clamp-1">
                                        {purchase.course?.title}
                                    </span>
                                </TableCell>
                                <TableCell className="text-[12px] font-bold text-slate-700">
                                    {new Intl.NumberFormat("en-US", {
                                        style: "currency",
                                        currency: purchase.currency || "USD",
                                    }).format(purchase.amount || 0)}
                                </TableCell>
                                <TableCell className="text-[12px] text-slate-500">
                                    <div className="flex items-center gap-x-2">
                                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                        {format(new Date(purchase.createdAt), "MMM dd, yyyy")}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="text-[10px] font-bold border-slate-200 text-slate-500 px-2 py-0 border-[1.5px]">
                                        {purchase.type}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-y-1.5">
                                        {purchase.status === "COMPLETED" ? (
                                            <div className="flex items-center gap-x-1.5 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full w-fit">
                                                <CheckCircle className="h-3 w-3" />
                                                <span className="text-[10px] font-bold uppercase">Completed</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-x-1.5 text-amber-600 bg-amber-50 px-2 py-1 rounded-full w-fit">
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                <span className="text-[10px] font-bold uppercase">Pending</span>
                                            </div>
                                        )}

                                        {/* Stripe Details */}
                                        {(purchase.stripeSessionId || purchase.stripePaymentIntentId) && (
                                            <div className="flex flex-col gap-y-0.5">
                                                <span className="text-[9px] font-mono text-slate-400 truncate max-w-[120px]" title={purchase.stripeSessionId || purchase.stripePaymentIntentId}>
                                                    ID: {purchase.stripeSessionId || purchase.stripePaymentIntentId}
                                                </span>
                                                {purchase.receiptUrl && (
                                                    <a
                                                        href={purchase.receiptUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-[9px] text-blue-500 hover:underline font-bold"
                                                    >
                                                        View Receipt
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right pr-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="text-[13px]">
                                            {purchase.status === "PENDING" && (
                                                <>
                                                    <DropdownMenuItem
                                                        onClick={() => onApprove(purchase.id)}
                                                        className="text-emerald-600 focus:text-emerald-600 font-medium cursor-pointer"
                                                        disabled={isLoading === purchase.id}
                                                    >
                                                        <CheckCircle className="h-3.5 w-3.5 mr-2" />
                                                        Approve Enrollment
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => onReject(purchase.id)}
                                                        className="text-destructive focus:text-destructive font-medium cursor-pointer"
                                                        disabled={isLoading === purchase.id}
                                                    >
                                                        <XCircle className="h-3.5 w-3.5 mr-2" />
                                                        Reject Enrollment
                                                    </DropdownMenuItem>
                                                </>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};
