"use client";

import { useEffect, useState } from "react";
import { getCoupons, createCoupon, updateCoupon, deleteCoupon } from "@/actions/coupon";
import { CouponType } from "@prisma/client";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import {
    Trash2, Pencil,
    Plus, MoreVertical, Filter,
    ArrowUpDown, Search, Calendar,
    ChevronLeft, ChevronRight, Tag,
    Percent, DollarSign,
    CheckCircle2,
    XCircle
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { toast } from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const formSchema = z.object({
    title: z.string().min(1, "Title is required"),
    slug: z.string().min(1, "Slug is required"),
    code: z.string().min(1, "Coupon code is required"),
    type: z.nativeEnum(CouponType),
    amount: z.coerce.number().min(0),
    maxRedemptions: z.coerce.number().min(0),
    startDate: z.string().optional().nullable(),
    endDate: z.string().optional().nullable(),
    applyToAllCourses: z.boolean().default(true),
    applyToAllGroups: z.boolean().default(true),
});

const CouponsPage = () => {
    const [coupons, setCoupons] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingCoupon, setEditingCoupon] = useState<any>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            title: "",
            slug: "",
            code: "",
            type: CouponType.FLAT,
            amount: 0,
            maxRedemptions: 0,
            startDate: "",
            endDate: "",
            applyToAllCourses: true,
            applyToAllGroups: true,
        },
    });

    const fetchCoupons = async () => {
        setIsLoading(true);
        const data = await getCoupons();
        setCoupons(data);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const formattedValues = {
                ...values,
                startDate: values.startDate ? new Date(values.startDate) : null,
                endDate: values.endDate ? new Date(values.endDate) : null,
            };

            let response;
            if (editingCoupon) {
                response = await updateCoupon(editingCoupon.id, formattedValues);
            } else {
                response = await createCoupon(formattedValues as any);
            }

            if (response) {
                toast.success(editingCoupon ? "Coupon updated" : "Coupon created");
                setIsDialogOpen(false);
                setEditingCoupon(null);
                form.reset();
                fetchCoupons();
            } else {
                toast.error("Something went wrong");
            }
        } catch (error) {
            console.error(error);
            toast.error("An unexpected error occurred");
        }
    };

    const onDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this coupon?")) {
            await deleteCoupon(id);
            toast.success("Coupon deleted");
            fetchCoupons();
        }
    };

    const onEdit = (coupon: any) => {
        setEditingCoupon(coupon);
        form.reset({
            title: coupon.title,
            slug: coupon.slug,
            code: coupon.code,
            type: coupon.type,
            amount: coupon.amount,
            maxRedemptions: coupon.maxRedemptions,
            startDate: coupon.startDate ? format(new Date(coupon.startDate), "yyyy-MM-dd'T'HH:mm") : "",
            endDate: coupon.endDate ? format(new Date(coupon.endDate), "yyyy-MM-dd'T'HH:mm") : "",
            applyToAllCourses: coupon.applyToAllCourses,
            applyToAllGroups: coupon.applyToAllGroups,
        });
        setIsDialogOpen(true);
    };

    const onAddNew = () => {
        setEditingCoupon(null);
        form.reset({
            title: "",
            slug: "",
            code: Math.random().toString(36).substring(2, 12),
            type: CouponType.FLAT,
            amount: 0,
            maxRedemptions: 0,
            startDate: "",
            endDate: "",
            applyToAllCourses: true,
            applyToAllGroups: true,
        });
        setIsDialogOpen(true);
    };

    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .replace(/ /g, "-")
            .replace(/[^\w-]+/g, "");
    };

    const onTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        form.setValue("title" as any, title);
        if (!editingCoupon) {
            form.setValue("slug" as any, generateSlug(title));
        }
    };

    const filteredCoupons = coupons.filter(coupon =>
        coupon.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coupon.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6 font-sans text-slate-900 dark:text-slate-100">
            <h1 className="text-[15px] font-bold text-slate-800 dark:text-slate-100">Coupons Management</h1>

            <Card className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900">
                <CardHeader className="bg-white dark:bg-slate-900 px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-x-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onAddNew}
                                className="h-8 w-8 text-slate-500 hover:text-slate-900"
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200">
                                <Filter className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200">
                                <ArrowUpDown className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="relative group">
                            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-600 dark:group-focus-within:text-slate-300 transition-colors" />
                            <Input
                                placeholder="Search Coupons"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-8 w-64 pl-9 bg-slate-50 dark:bg-slate-800 border-none text-[13px] focus-visible:ring-1 focus-visible:ring-slate-200 dark:focus-visible:ring-slate-700"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                <TableHead className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter pl-6">Coupon</TableHead>
                                <TableHead className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">Type</TableHead>
                                <TableHead className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">Amount</TableHead>
                                <TableHead className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">Redemptions</TableHead>
                                <TableHead className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">Ends At</TableHead>
                                <TableHead className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">Status</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center text-slate-500">Loading coupons...</TableCell>
                                </TableRow>
                            ) : filteredCoupons.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center text-slate-500">No coupons found.</TableCell>
                                </TableRow>
                            ) : (
                                filteredCoupons.map((coupon) => (
                                    <TableRow key={coupon.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 border-b dark:border-slate-800 last:border-0 transition-colors">
                                        <TableCell className="pl-6">
                                            <div className="flex flex-col">
                                                <span className="text-[12px] font-bold text-slate-700 dark:text-slate-200 leading-tight">{coupon.title}</span>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <Badge variant="outline" className="text-[9px] h-4 bg-slate-50 dark:bg-slate-800 font-mono text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700">
                                                        {coupon.code}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5">
                                                {coupon.type === "PERCENTAGE" ? (
                                                    <Percent className="h-3 w-3 text-blue-400" />
                                                ) : (
                                                    <DollarSign className="h-3 w-3 text-emerald-400" />
                                                )}
                                                <span className="text-[12px] text-slate-500 dark:text-slate-400 font-medium">
                                                    {coupon.type === "PERCENTAGE" ? "Percentage Off" : "Flat Rate"}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-[12px] font-bold text-slate-700 dark:text-slate-200">
                                                {coupon.type === "PERCENTAGE" ? `${coupon.amount}%` : `$${coupon.amount}`}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-[12px] text-slate-500 font-medium">
                                                    {coupon.redemptions} / {coupon.maxRedemptions === 0 ? "∞" : coupon.maxRedemptions}
                                                </span>
                                                <div className="w-16 h-1 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                                                    <div
                                                        className="h-full bg-slate-300"
                                                        style={{ width: `${coupon.maxRedemptions === 0 ? 0 : Math.min((coupon.redemptions / coupon.maxRedemptions) * 100, 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {coupon.endDate ? (
                                                <div className="flex items-center gap-2 text-slate-400 text-[12px]">
                                                    <Calendar className="h-3 w-3 text-slate-300" />
                                                    {format(new Date(coupon.endDate), "MMM dd, yyyy")}
                                                </div>
                                            ) : (
                                                <span className="text-[11px] text-slate-300 italic uppercase font-bold tracking-tighter">No expiration</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {(!coupon.endDate || new Date(coupon.endDate) > new Date()) &&
                                                (coupon.maxRedemptions === 0 || coupon.redemptions < coupon.maxRedemptions) ? (
                                                <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full w-fit">
                                                    <CheckCircle2 className="h-2.5 w-2.5" />
                                                    <span className="text-[9px] font-bold uppercase tracking-wider">Active</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full w-fit">
                                                    <XCircle className="h-2.5 w-2.5" />
                                                    <span className="text-[9px] font-bold uppercase tracking-wider">Expired</span>
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="pr-6">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <MoreVertical className="h-4 w-4 text-slate-400" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-36">
                                                    <DropdownMenuItem onClick={() => onEdit(coupon)} className="text-[13px] font-medium gap-2">
                                                        <Pencil className="h-3.5 w-3.5" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => onDelete(coupon.id)} className="text-[13px] font-medium text-rose-600 focus:text-rose-600 gap-2">
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <div className="flex items-center justify-center gap-x-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 border bg-white dark:bg-slate-900 dark:border-slate-800 shadow-sm"><ChevronLeft className="h-4 w-4" /></Button>
                {[1].map(p => (
                    <Button key={p} variant="default" className="h-8 w-10 text-[12px] font-bold border bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm dark:border-slate-700">{p}</Button>
                ))}
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 border bg-white dark:bg-slate-900 dark:border-slate-800 shadow-sm"><ChevronRight className="h-4 w-4" /></Button>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[1000px] font-sans p-0 overflow-hidden bg-white">
                    <DialogHeader className="px-6 py-4 border-b">
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <Tag className="h-5 w-5 text-slate-400" />
                            {editingCoupon ? "Edit Coupon" : "Add New Coupon"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="p-0 overflow-y-auto max-h-[85vh]">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="pb-6">
                                <div className="p-6 space-y-6">
                                    <div className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="title"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            onChange={onTitleChange}
                                                            placeholder="Add Coupon title"
                                                            className="h-12 text-lg font-bold border-slate-200 focus-visible:ring-0 focus-visible:border-slate-400 transition-all rounded-none border-t-0 border-x-0 border-b-2 px-0"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="slug"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">Slug</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} className="h-9 bg-slate-50 border-slate-200 text-slate-600 pointer-events-none" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="bg-slate-50/50 rounded-xl border border-slate-100 overflow-hidden">
                                        <div className="bg-slate-100/50 px-4 py-2 border-b border-slate-200">
                                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Settings</span>
                                        </div>
                                        <div className="p-6 space-y-8">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                                                <FormField
                                                    control={form.control}
                                                    name="code"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <div className="flex items-center gap-1.5 mb-1.5">
                                                                <FormLabel className="text-[13px] font-bold text-slate-700">Coupon Code</FormLabel>
                                                                <span className="text-rose-500 text-[10px]">*</span>
                                                            </div>
                                                            <FormControl>
                                                                <Input {...field} className="h-10 bg-white border-slate-200 focus-visible:ring-slate-200 font-mono tracking-wider" />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="type"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-[13px] font-bold text-slate-700 mb-1.5 block">Type</FormLabel>
                                                            <FormControl>
                                                                <RadioGroup
                                                                    onValueChange={field.onChange}
                                                                    defaultValue={field.value}
                                                                    className="flex gap-x-16 pt-2"
                                                                >
                                                                    <div className="flex items-center space-x-2">
                                                                        <RadioGroupItem value={CouponType.FLAT} id="flat" />
                                                                        <label htmlFor="flat" className="text-sm font-medium text-slate-600 cursor-pointer">Flat Rate</label>
                                                                    </div>
                                                                    <div className="flex items-center space-x-2">
                                                                        <RadioGroupItem value={CouponType.PERCENTAGE} id="percentage" />
                                                                        <label htmlFor="percentage" className="text-sm font-medium text-slate-600 cursor-pointer">Percentage Off</label>
                                                                    </div>
                                                                </RadioGroup>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                                                <FormField
                                                    control={form.control}
                                                    name="amount"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <div className="flex items-center gap-1.5 mb-1.5">
                                                                <FormLabel className="text-[13px] font-bold text-slate-700">Amount</FormLabel>
                                                                <span className="text-rose-500 text-[10px]">*</span>
                                                            </div>
                                                            <FormControl>
                                                                <div className="relative">
                                                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                                                        {form.watch("type") === "PERCENTAGE" ? <Percent className="h-4 w-4" /> : <DollarSign className="h-4 w-4" />}
                                                                    </div>
                                                                    <Input
                                                                        type="number"
                                                                        {...field}
                                                                        className="h-10 pl-9 bg-white border-slate-200 focus-visible:ring-slate-200 font-bold"
                                                                    />
                                                                </div>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="maxRedemptions"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <div className="flex items-center gap-1.5 mb-1.5">
                                                                <FormLabel className="text-[13px] font-bold text-slate-700">Number of Redemptions</FormLabel>
                                                                <span className="text-rose-500 text-[10px]">*</span>
                                                            </div>
                                                            <FormControl>
                                                                <Input type="number" {...field} className="h-10 bg-white border-slate-200 focus-visible:ring-slate-200" />
                                                            </FormControl>
                                                            <FormDescription className="text-[11px]">Set to 0 for unlimited redemptions.</FormDescription>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                                                <FormField
                                                    control={form.control}
                                                    name="startDate"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-[13px] font-bold text-slate-700 mb-1.5 block">Start Date</FormLabel>
                                                            <FormControl>
                                                                <Input type="datetime-local" {...field} value={field.value || ""} className="h-10 bg-white border-slate-200 focus-visible:ring-slate-200" />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="endDate"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-[13px] font-bold text-slate-700 mb-1.5 block">End Date</FormLabel>
                                                            <FormControl>
                                                                <Input type="datetime-local" {...field} value={field.value || ""} className="h-10 bg-white border-slate-200 focus-visible:ring-slate-200" />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                                <FormField
                                                    control={form.control}
                                                    name="applyToAllCourses"
                                                    render={({ field }) => (
                                                        <FormItem className="flex items-center justify-between">
                                                            <FormLabel className="text-[13px] font-medium text-slate-600">Apply to all courses</FormLabel>
                                                            <FormControl>
                                                                <Switch
                                                                    checked={field.value}
                                                                    onCheckedChange={field.onChange}
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="applyToAllGroups"
                                                    render={({ field }) => (
                                                        <FormItem className="flex items-center justify-between">
                                                            <FormLabel className="text-[13px] font-medium text-slate-600">Apply to all groups</FormLabel>
                                                            <FormControl>
                                                                <Switch
                                                                    checked={field.value}
                                                                    onCheckedChange={field.onChange}
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-6 py-4 bg-slate-50 flex justify-end gap-3 mt-4 border-t">
                                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="font-bold">Cancel</Button>
                                    <Button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-8">
                                        {editingCoupon ? "Save Changes" : "Create Coupon"}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default CouponsPage;
