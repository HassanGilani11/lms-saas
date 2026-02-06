"use client";

import { useEffect, useState } from "react";
import { adminDeleteCourse } from "@/actions/course";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Trash2, BookOpen, MoreVertical, Eye, Plus, Pencil, Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "react-hot-toast";
import { getAdminCourses } from "@/actions/admin";

const AdminCoursesPage = () => {
    const [courses, setCourses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();

    const fetchCourses = async () => {
        setIsLoading(true);
        const data = await getAdminCourses();
        setCourses(data);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const onDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm("Are you sure? This will permanently delete the course and all its content.")) {
            await adminDeleteCourse(id);
            toast.success("Course deleted successfully");
            fetchCourses();
        }
    };

    const filteredCourses = courses.filter(course => {
        const titleMatch = (course.title || "").toLowerCase().includes(searchQuery.toLowerCase());
        const categoryMatch = (course.category?.name || "").toLowerCase().includes(searchQuery.toLowerCase());
        return titleMatch || categoryMatch;
    });

    return (
        <div className="p-6 text-black font-sans space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-[17px] font-bold text-slate-800">Course Lists</h1>
            </div>

            <Card className="border-none shadow-sm overflow-hidden bg-white">
                <CardHeader className="px-6 py-4 border-b">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-x-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-500 hover:text-slate-900"
                                onClick={() => router.push("/admin/courses/create")}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
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
                                placeholder="Search courses"
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
                                <TableHead className="pl-6 font-bold text-slate-400 text-[11px] uppercase tracking-tighter">Name</TableHead>
                                <TableHead className="font-bold text-slate-400 text-[11px] uppercase tracking-tighter">Category</TableHead>
                                <TableHead className="font-bold text-slate-400 text-[11px] uppercase tracking-tighter text-center">Date</TableHead>
                                <TableHead className="font-bold text-slate-400 text-[11px] uppercase tracking-tighter text-center">Status</TableHead>
                                <TableHead className="text-right pr-6 font-bold text-slate-400 text-[11px] uppercase tracking-tighter">Options</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCourses.map((course) => (
                                <TableRow
                                    key={course.id}
                                    className="group hover:bg-slate-50/50 border-b last:border-0 cursor-pointer transition-colors"
                                    onClick={() => router.push(`/admin/courses/${course.id}/detail`)}
                                >
                                    <TableCell className="pl-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-[13px] font-medium text-slate-700">{course.title}</span>
                                            {course.courseCode && (
                                                <span className="text-[11px] text-slate-400 font-mono mt-0.5">{course.courseCode}</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-slate-600 text-[12px]">
                                        {course.category?.name || "-"}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-x-2 text-[12px] text-slate-500">
                                            <BookOpen className="h-3.5 w-3.5 text-slate-400" />
                                            {format(new Date(course.createdAt), "MMM dd, yyyy")}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center">
                                            {!course.isActive ? (
                                                <Badge className="bg-rose-50 text-rose-600 hover:bg-rose-50 border-rose-100 rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                                                    Inactive
                                                </Badge>
                                            ) : course.isPublished ? (
                                                <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-50 border-emerald-100 rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                                                    Published
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-amber-50 text-amber-600 hover:bg-amber-50 border-amber-100 rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                                                    Draft
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="text-[13px] font-medium min-w-[140px]">
                                                <DropdownMenuItem
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.push(`/admin/courses/${course.id}/detail`);
                                                    }}
                                                >
                                                    <Eye className="h-3.5 w-3.5 mr-2" />
                                                    View Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.push(`/admin/courses/${course.id}/edit`);
                                                    }}
                                                >
                                                    <Pencil className="h-3.5 w-3.5 mr-2" />
                                                    Edit Course
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={(e) => onDelete(course.id, e)}
                                                    className="text-destructive focus:text-destructive"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {(filteredCourses.length === 0 || isLoading) && (
                        <div className="text-center py-24 text-slate-400 flex flex-col items-center gap-y-2">
                            <BookOpen className="h-10 w-10 text-slate-100" />
                            <p className="text-[13px] font-medium">{isLoading ? "Loading courses..." : "No courses found."}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="flex items-center justify-center gap-x-2 pt-4">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 border bg-white shadow-sm"><ChevronLeft className="h-4 w-4" /></Button>
                {[1, 2, 3, 4, 5].map(p => (
                    <Button key={p} variant={p === 1 ? "default" : "ghost"} className={`h-8 w-10 text-[12px] font-bold border ${p === 1 ? "bg-slate-100 text-slate-900 shadow-sm" : "bg-white text-slate-400 shadow-sm"}`}>{p}</Button>
                ))}
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 border bg-white shadow-sm"><ChevronRight className="h-4 w-4" /></Button>
            </div>
        </div>
    );
};

export default AdminCoursesPage;
