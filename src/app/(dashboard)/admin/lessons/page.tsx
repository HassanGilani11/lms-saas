"use client";

import { useEffect, useState } from "react";
import {
    BookOpen,
    Search,
    Plus,
    Filter,
    ArrowUpDown,
    MoreVertical,
    Pencil,
    Trash2,
    ChevronLeft,
    ChevronRight,
    LayoutGrid
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { getAdminLessons } from "@/actions/curriculum";
import { getAdminCourses } from "@/actions/admin";
import { createLesson, deleteLesson } from "@/actions/lesson";

const AdminLessonsPage = () => {
    const router = useRouter();
    const [lessons, setLessons] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Create Dialog State
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [newLessonTitle, setNewLessonTitle] = useState("");
    const [selectedCourseId, setSelectedCourseId] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [lessonsData, coursesData] = await Promise.all([
                getAdminLessons(),
                getAdminCourses()
            ]);
            setLessons(lessonsData);
            setCourses(coursesData);
        } catch (error) {
            toast.error("Failed to fetch data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onCreateLesson = async () => {
        if (!newLessonTitle || !selectedCourseId) {
            toast.error("Please fill in all fields");
            return;
        }

        try {
            setIsSubmitting(true);
            await createLesson(selectedCourseId, newLessonTitle);
            toast.success("Lesson created");
            setIsCreateDialogOpen(false);
            setNewLessonTitle("");
            setSelectedCourseId("");
            fetchData();
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    const onDeleteLesson = async (id: string) => {
        if (!confirm("Are you sure you want to delete this lesson?")) return;

        try {
            await deleteLesson(id);
            toast.success("Lesson deleted");
            fetchData();
        } catch (error) {
            toast.error("Something went wrong");
        }
    };

    const filteredLessons = lessons.filter((lesson) => {
        const searchStr = searchQuery.toLowerCase();
        return (
            lesson.title?.toLowerCase().includes(searchStr) ||
            lesson.course?.title?.toLowerCase().includes(searchStr)
        );
    });

    return (
        <div className="p-6 text-black font-sans space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-[17px] font-bold text-slate-800">Lessons</h1>
            </div>

            <Card className="border-none shadow-sm overflow-hidden bg-white">
                <CardHeader className="px-6 py-4 border-b">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-x-2">
                            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-slate-500 hover:text-slate-900"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Create New Lesson</DialogTitle>
                                        <DialogDescription>
                                            Add a new lesson to one of your existing courses.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Lesson Title</label>
                                            <Input
                                                placeholder="e.g. Introduction to Next.js"
                                                value={newLessonTitle}
                                                onChange={(e) => setNewLessonTitle(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Select Course</label>
                                            <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Choose a course..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {courses.map((course) => (
                                                        <SelectItem key={course.id} value={course.id}>
                                                            {course.title}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                                        <Button onClick={onCreateLesson} disabled={isSubmitting} className="bg-slate-900">
                                            {isSubmitting ? "Creating..." : "Create Lesson"}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
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
                                placeholder="Search by lesson or course title..."
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
                                <TableHead className="pl-6 font-bold text-slate-400 text-[11px] uppercase tracking-tighter">Lesson Title</TableHead>
                                <TableHead className="font-bold text-slate-400 text-[11px] uppercase tracking-tighter">Parent Course</TableHead>
                                <TableHead className="font-bold text-slate-400 text-[11px] uppercase tracking-tighter text-center">Topics</TableHead>
                                <TableHead className="text-right pr-6 font-bold text-slate-400 text-[11px] uppercase tracking-tighter">Options</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredLessons.map((lesson) => (
                                <TableRow key={lesson.id} className="group hover:bg-slate-50/50 transition-colors border-b last:border-0">
                                    <TableCell className="pl-6 h-14">
                                        <div className="flex items-center gap-x-3">
                                            <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                                                <BookOpen className="h-4 w-4 text-indigo-600" />
                                            </div>
                                            <span className="font-medium text-[13px] text-slate-700">{lesson.title}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="h-14">
                                        <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-100 font-medium text-[12px]">
                                            {lesson.course?.title || "N/A"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center h-14">
                                        <span className="text-[12px] text-slate-500 font-bold bg-slate-100 px-2 py-1 rounded-md">
                                            {lesson._count?.topics || 0}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right pr-6 h-14">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="text-[13px] font-medium min-w-[140px]">
                                                <DropdownMenuItem onClick={() => router.push(`/admin/lessons/${lesson.id}/edit`)}>
                                                    <Pencil className="h-3.5 w-3.5 mr-2" />
                                                    Edit Lesson
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => window.open(`/admin/courses/${lesson.courseId}/edit`, '_self')}>
                                                    <BookOpen className="h-3.5 w-3.5 mr-2" />
                                                    View in Course
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => onDeleteLesson(lesson.id)}
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
                    {(filteredLessons.length === 0 || isLoading) && (
                        <div className="text-center py-24 text-slate-400 flex flex-col items-center gap-y-2">
                            <LayoutGrid className="h-10 w-10 text-slate-100" />
                            <p className="text-[13px] font-medium">{isLoading ? "Loading lessons..." : "No lessons found."}</p>
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

export default AdminLessonsPage;
