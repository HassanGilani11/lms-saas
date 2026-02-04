"use client";

import { useEffect, useState } from "react";
import {
    Plus, Search, MoreVertical,
    Filter, ArrowUpDown, ChevronLeft,
    ChevronRight, BookOpen, Trash2, Pencil, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    getLearningPaths,
    createLearningPath,
    deleteLearningPath
} from "@/actions/learning-path";
import { getCategories } from "@/actions/category";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

const formSchema = z.object({
    title: z.string().min(1, "Title is required"),
    categoryId: z.string().optional(),
});

const LearningPathsPage = () => {
    const router = useRouter();
    const [paths, setPaths] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            categoryId: "",
        },
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        const [pathsData, categoriesData] = await Promise.all([
            getLearningPaths(),
            getCategories()
        ]);
        setPaths(pathsData);
        setCategories(categoriesData);
        setIsLoading(false);
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        const result = await createLearningPath(values);
        if (result) {
            toast.success("Learning path created");
            setIsDialogOpen(false);
            form.reset();
            fetchData();
            router.push(`/admin/learning-paths/${result.id}`);
        } else {
            toast.error("Something went wrong");
        }
    };

    const onDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this learning path?")) return;
        const result = await deleteLearningPath(id);
        if (result.success) {
            toast.success("Learning path deleted");
            fetchData();
        } else {
            toast.error("Failed to delete");
        }
    };

    const filteredPaths = paths.filter(path =>
        path.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6 bg-[#f8fafc] min-h-full font-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-[20px] font-bold text-slate-900 tracking-tight">Learning Pathways</h1>
                    <p className="text-[13px] text-slate-500 mt-1">Manage and curate course sequences for your students.</p>
                </div>
                <div className="flex items-center gap-x-3">
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-slate-900 hover:bg-slate-800 text-white text-[13px] font-bold h-10 px-4 rounded-lg flex items-center gap-2 transition-all">
                                <Plus className="h-4 w-4" />
                                Add Learning Path
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="font-sans">
                            <DialogHeader>
                                <DialogTitle className="text-[16px] font-bold">Create New Learning Path</DialogTitle>
                            </DialogHeader>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[13px] font-bold text-slate-700">Path Title</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g. Full Stack Web Development" className="h-10 text-[13px]" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="categoryId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[13px] font-bold text-slate-700">Category</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-10 text-[13px]">
                                                            <SelectValue placeholder="Select a category" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {categories.map((cat) => (
                                                            <SelectItem key={cat.id} value={cat.id} className="text-[13px]">{cat.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" className="w-full h-10 bg-slate-900 text-[13px] font-bold mt-6" disabled={form.formState.isSubmitting}>
                                        Create Path
                                    </Button>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Stats/Filters Row */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search learning paths..."
                        className="pl-10 h-10 bg-slate-50/50 border-slate-100 text-[13px] focus-visible:ring-slate-200"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-x-2 w-full md:w-auto">
                    <Button variant="outline" className="h-10 text-[13px] font-medium border-slate-100 flex items-center gap-2">
                        <Filter className="h-4 w-4" /> Filter
                    </Button>
                    <Button variant="outline" className="h-10 text-[13px] font-medium border-slate-100 flex items-center gap-2">
                        <ArrowUpDown className="h-4 w-4" /> Sort
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                            <TableHead className="pl-6 font-bold text-slate-400 text-[11px] uppercase tracking-tighter">Path Info</TableHead>
                            <TableHead className="font-bold text-slate-400 text-[11px] uppercase tracking-tighter text-center">Courses</TableHead>
                            <TableHead className="font-bold text-slate-400 text-[11px] uppercase tracking-tighter text-center">Enrollments</TableHead>
                            <TableHead className="font-bold text-slate-400 text-[11px] uppercase tracking-tighter">Category</TableHead>
                            <TableHead className="font-bold text-slate-400 text-[11px] uppercase tracking-tighter">Status</TableHead>
                            <TableHead className="text-right pr-6 font-bold text-slate-400 text-[11px] uppercase tracking-tighter">Options</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={6} className="h-24 text-center text-slate-400 text-[13px]">Loading learning paths...</TableCell></TableRow>
                        ) : filteredPaths.length === 0 ? (
                            <TableRow><TableCell colSpan={6} className="h-24 text-center text-slate-400 text-[13px]">No learning paths found.</TableCell></TableRow>
                        ) : filteredPaths.map((path) => (
                            <TableRow key={path.id} className="group hover:bg-slate-50/50 transition-colors border-b last:border-0">
                                <TableCell className="pl-6 py-4">
                                    <div className="flex items-center gap-x-3 group cursor-pointer" onClick={() => router.push(`/admin/learning-paths/${path.id}`)}>
                                        <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-slate-200 transition-colors">
                                            <BookOpen className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-[13px] text-slate-700 leading-none group-hover:text-blue-600 transition-colors">{path.title}</p>
                                            <p className="text-[11px] text-slate-400 mt-1">{path.slug || "No slug"}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-center py-4">
                                    <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-blue-100 text-[11px] font-bold px-2 py-0.5">{path._count.courses}</Badge>
                                </TableCell>
                                <TableCell className="text-center py-4">
                                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-emerald-100 text-[11px] font-bold px-2 py-0.5">{path._count.enrollments}</Badge>
                                </TableCell>
                                <TableCell className="py-4">
                                    <span className="text-[13px] text-slate-600 font-medium">{path.category?.name || "-"}</span>
                                </TableCell>
                                <TableCell className="py-4">
                                    <Badge className={`${path.isActive ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-600 border-slate-100"} text-[11px] font-bold px-2 py-0.5 border shadow-none`}>
                                        {path.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right pr-6 py-4">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 group-hover:text-slate-600 transition-colors">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="text-[13px] font-medium min-w-[120px]">
                                            <DropdownMenuItem onClick={() => router.push(`/admin/learning-paths/${path.id}`)} className="cursor-pointer">
                                                <Eye className="h-3.5 w-3.5 mr-2" /> View
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => router.push(`/admin/learning-paths/${path.id}?tab=basic-info`)} className="cursor-pointer">
                                                <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => onDelete(path.id)} className="text-destructive focus:text-destructive cursor-pointer">
                                                <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Placeholder */}
            <div className="flex items-center justify-between px-2 pt-4 border-t border-slate-100">
                <p className="text-[12px] text-slate-500 font-medium">Showing <span className="text-slate-900">{filteredPaths.length}</span> results</p>
                <div className="flex items-center gap-x-2">
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled><ChevronLeft className="h-4 w-4" /></Button>
                    <div className="flex items-center gap-x-1">
                        <Button variant="secondary" size="sm" className="h-8 w-8 p-0 text-[12px] font-bold bg-slate-900 text-white">1</Button>
                    </div>
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled><ChevronRight className="h-4 w-4" /></Button>
                </div>
            </div>
        </div>
    );
};

export default LearningPathsPage;
