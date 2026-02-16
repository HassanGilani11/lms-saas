"use client";

import { useEffect, useState } from "react";
import { getUsers, deleteUser, updateUser, createUser, resendVerificationAction } from "@/actions/user";
import { UserRole } from "@/lib/prisma";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
    ChevronLeft, ChevronRight, Eye, EyeOff,
    CheckCircle, XCircle, Mail
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
} from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { toast } from "react-hot-toast";
import { FileUpload } from "@/components/shared/file-upload";

const formSchema = z.object({
    name: z.string().min(1, "Full name is required").max(50, "Name too long"),
    email: z.string().email("Please enter a valid email address"),
    phone: z.string().min(5, "Phone number is too short").max(20, "Phone number is too long").optional().or(z.literal("")),
    address: z.string().min(5, "Address must be more descriptive").optional().or(z.literal("")),
    role: z.nativeEnum(UserRole),
    password: z.string().optional(),
    emailVerified: z.boolean().default(false),
    image: z.string().optional().or(z.literal("")),
}).refine((data) => {
    // If we're creating (password would be expected), it should be checked elsewhere or here
    // But since this schema is shared, we'll handle the 'required' part in the component logic or refine
    return true;
}, {
    message: "Password is required for new accounts",
    path: ["password"],
});

const AdministratorPage = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [viewingUser, setViewingUser] = useState<any>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            address: "",
            role: UserRole.ADMIN,
            password: "",
            emailVerified: false,
            image: "",
        },
    });

    const fetchUsers = async () => {
        setIsLoading(true);
        const data = await getUsers(UserRole.ADMIN);
        setUsers(data);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            if (!editingUser && (!values.password || values.password.length < 6)) {
                form.setError("password", {
                    type: "manual",
                    message: "Password is required for new accounts (min 6 characters)"
                });
                return;
            }

            let response;
            if (editingUser) {
                response = await updateUser(editingUser.id, values);
            } else {
                response = await createUser(values);
            }

            if (response.success) {
                toast.success(editingUser ? "Admin updated" : "Admin created");
                setIsDialogOpen(false);
                setEditingUser(null);
                form.reset();
                fetchUsers();
            } else {
                toast.error(response.error || "Something went wrong");
            }
        } catch (error) {
            console.error("Submission error:", error);
            toast.error("An unexpected error occurred");
        }
    };

    const resendVerification = async (email: string) => {
        const response = await resendVerificationAction(email);
        if (response.success) {
            toast.success("Verification email sent!");
        } else {
            toast.error(response.error || "Failed to send email");
        }
    };

    const onDelete = async (userId: string) => {
        if (confirm("Are you sure you want to delete this admin?")) {
            await deleteUser(userId);
            toast.success("Admin deleted");
            fetchUsers();
        }
    };

    const onEdit = (user: any) => {
        setEditingUser(user);
        form.reset({
            name: user.name || "",
            email: user.email || "",
            phone: user.phone || "",
            address: user.address || "",
            role: user.role,
            password: "",
            emailVerified: !!user.emailVerified,
            image: user.image || "",
        });
        setIsDialogOpen(true);
    };

    const onView = (user: any) => {
        setViewingUser(user);
        setIsViewDialogOpen(true);
    };

    const onAddNew = () => {
        setEditingUser(null);
        form.reset({
            name: "",
            email: "",
            phone: "",
            address: "",
            role: UserRole.ADMIN,
            password: "",
            emailVerified: false,
            image: "",
        });
        setIsDialogOpen(true);
    };

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 font-sans text-slate-900 dark:text-slate-100">
            <h1 className="text-[15px] font-bold text-slate-800 dark:text-slate-100">Administrator Lists</h1>

            <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-white dark:bg-slate-900 px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-x-2">
                            <Button variant="ghost" size="icon" onClick={onAddNew} className="h-8 w-8 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200">
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
                            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-slate-600 dark:group-focus-within:text-slate-300 transition-colors" />
                            <Input
                                placeholder="Search Admins"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-8 w-64 pl-9 bg-slate-50 dark:bg-slate-950 border-none dark:border-slate-800 text-[13px] dark:text-slate-200 focus-visible:ring-1 focus-visible:ring-slate-200 dark:focus-visible:ring-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                                <TableHead className="w-[100px] text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter pl-6">ID#</TableHead>
                                <TableHead className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">Name</TableHead>
                                <TableHead className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">Email</TableHead>
                                <TableHead className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">Address</TableHead>
                                <TableHead className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">Date</TableHead>
                                <TableHead className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">Status</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.map((user, idx) => (
                                <TableRow key={user.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 last:border-0 transition-colors">
                                    <TableCell className="text-[12px] font-medium text-slate-500 dark:text-slate-400 pl-6">#{1015 + idx}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-x-3">
                                            <Avatar className="h-7 w-7 border border-slate-200 dark:border-slate-700">
                                                <AvatarImage src={user.image || ""} />
                                                <AvatarFallback className="text-[10px] bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300">{user.name?.[0] || "?"}</AvatarFallback>
                                            </Avatar>
                                            <span className="text-[12px] font-medium text-slate-700 dark:text-slate-200">{user.name || "N/A"}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-[12px] text-slate-500 dark:text-slate-400">{user.email}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400">{user.phone || "No phone"}</span>
                                            <span className="text-[10px] text-slate-400 dark:text-slate-500 line-clamp-1">{user.address || "No address"}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-[12px] text-slate-500 dark:text-slate-400">
                                        <div className="flex items-center gap-x-2">
                                            <Calendar className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                                            {format(new Date(user.createdAt), "MMM dd, yyyy")}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {user.emailVerified ? (
                                            <div className="flex items-center gap-x-1.5 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full w-fit">
                                                <CheckCircle className="h-3 w-3" />
                                                <span className="text-[10px] font-bold">Verified</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-x-1.5 text-amber-600 bg-amber-50 px-2 py-1 rounded-full w-fit">
                                                <XCircle className="h-3 w-3" />
                                                <span className="text-[10px] font-bold">Pending</span>
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right pr-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="text-[13px]">
                                                <DropdownMenuItem onClick={() => onView(user)}><Eye className="h-3.5 w-3.5 mr-2" />View</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => onEdit(user)}><Pencil className="h-3.5 w-3.5 mr-2" />Edit</DropdownMenuItem>
                                                {!user.emailVerified && (
                                                    <DropdownMenuItem onClick={() => resendVerification(user.email)} className="text-emerald-600 focus:text-emerald-600 font-bold">
                                                        <Mail className="h-3.5 w-3.5 mr-2" />Resend Verification
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem onClick={() => onDelete(user.id)} className="text-destructive focus:text-destructive"><Trash2 className="h-3.5 w-3.5 mr-2" />Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <div className="flex items-center justify-center gap-x-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 dark:text-slate-500 border dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800"><ChevronLeft className="h-4 w-4" /></Button>
                {[1, 2, 3, 4, 5].map(p => (
                    <Button key={p} variant={p === 1 ? "default" : "ghost"} className={`h-8 w-10 text-[12px] font-bold border dark:border-slate-800 ${p === 1 ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm" : "bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800"}`}>{p}</Button>
                ))}
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 dark:text-slate-500 border dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800"><ChevronRight className="h-4 w-4" /></Button>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="font-sans max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
                    <DialogHeader className="p-6 pb-2">
                        <DialogTitle className="text-[16px] font-bold">
                            {editingUser ? "Edit Admin" : "Create New Admin"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto p-6 pt-2">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[13px] font-bold text-slate-700 dark:text-slate-300">Full Name</FormLabel>
                                                <FormControl><Input placeholder="John Doe" className="h-10 text-[13px]" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[13px] font-bold text-slate-700 dark:text-slate-300">Email Address</FormLabel>
                                                <FormControl><Input placeholder="john@example.com" className="h-10 text-[13px]" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[13px] font-bold text-slate-700 dark:text-slate-300">Phone Number</FormLabel>
                                                <FormControl><Input placeholder="+1 234 567 890" className="h-10 text-[13px]" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="address"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[13px] font-bold text-slate-700 dark:text-slate-300">Address</FormLabel>
                                                <FormControl><Input placeholder="123 Street Name, City" className="h-10 text-[13px]" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="image"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[13px] font-bold text-slate-700 dark:text-slate-300">Profile Image</FormLabel>
                                            <FormControl>
                                                <FileUpload
                                                    endpoint="imageUploader"
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[13px] font-bold text-slate-700 dark:text-slate-300">
                                                {editingUser ? "New Password (leave blank to keep current)" : "Password"}
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        type={showPassword ? "text" : "password"}
                                                        placeholder="******"
                                                        className="h-10 text-[13px] pr-10"
                                                        {...field}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-400"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                    >
                                                        {showPassword ? (
                                                            <EyeOff className="h-4 w-4" />
                                                        ) : (
                                                            <Eye className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="emailVerified"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm dark:border-slate-800">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-[13px] font-bold text-slate-700 dark:text-slate-300">Email Verified</FormLabel>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full h-10 bg-slate-900 text-[13px] font-bold mt-2 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200" disabled={form.formState.isSubmitting}>
                                    {editingUser ? "Save Changes" : "Create Admin"}
                                </Button>
                            </form>
                        </Form>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogContent className="font-sans max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-[16px] font-bold">Admin Details</DialogTitle>
                    </DialogHeader>
                    {viewingUser && (
                        <div className="space-y-4 pt-4">
                            <div className="flex items-center gap-x-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                                <Avatar className="h-12 w-12 border border-slate-200 dark:border-slate-700">
                                    <AvatarImage src={viewingUser.image || ""} />
                                    <AvatarFallback className="text-[14px] bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300">{viewingUser.name?.[0] || "?"}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-[15px] font-bold text-slate-900 dark:text-slate-100">{viewingUser.name || "N/A"}</p>
                                    <p className="text-[12px] text-slate-500 dark:text-slate-400">{viewingUser.role}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase">Email Address</p>
                                    <p className="text-[13px] text-slate-700 dark:text-slate-300">{viewingUser.email}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase">Phone Number</p>
                                    <p className="text-[13px] text-slate-700 dark:text-slate-300">{viewingUser.phone || "N/A"}</p>
                                </div>
                                <div className="space-y-1 col-span-2">
                                    <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase">Address</p>
                                    <p className="text-[13px] text-slate-700 dark:text-slate-300">{viewingUser.address || "N/A"}</p>
                                </div>
                                <div className="space-y-1 col-span-2">
                                    <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase">Registered Date</p>
                                    <p className="text-[13px] text-slate-700 dark:text-slate-300">{format(new Date(viewingUser.createdAt), "MMMM dd, yyyy")}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdministratorPage;
