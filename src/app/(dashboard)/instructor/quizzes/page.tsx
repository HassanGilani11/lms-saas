"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
    Plus,
    Pencil,
    Trash2,
    MoreVertical,
    CheckCircle,
    Search,
    Filter,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    LayoutGrid
} from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

import { getInstructorQuizzes, getInstructorCourses } from "@/actions/instructor-curriculum";
import { deleteQuiz, createQuiz } from "@/actions/quiz";

const InstructorQuizzesPage = () => {
    const router = useRouter();
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Create Dialog State
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [newQuizTitle, setNewQuizTitle] = useState("");
    const [selectedCourseId, setSelectedCourseId] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [quizzesData, coursesData] = await Promise.all([
                getInstructorQuizzes(),
                getInstructorCourses()
            ]);
            setQuizzes(quizzesData);
            setCourses(coursesData);
        } catch (error) {
            toast.error("Failed to load data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onCreateQuiz = async () => {
        if (!newQuizTitle || !selectedCourseId) {
            toast.error("Please fill in all fields");
            return;
        }

        try {
            setIsSubmitting(true);
            const newQuiz = await createQuiz(selectedCourseId, newQuizTitle);

            if (newQuiz) {
                toast.success("Quiz created");
                setIsCreateDialogOpen(false);
                setNewQuizTitle("");
                fetchData();
            } else {
                toast.error("Failed to create quiz");
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    const onDelete = async (id: string) => {
        if (!confirm("Are you sure? This will delete the quiz and all associated attempts.")) return;
        try {
            await deleteQuiz(id);
            toast.success("Quiz deleted");
            fetchData();
        } catch (error) {
            toast.error("Deletion failed");
        }
    };

    const filteredQuizzes = quizzes.filter((quiz) => {
        const searchStr = searchQuery.toLowerCase();
        return (
            quiz.title?.toLowerCase().includes(searchStr) ||
            quiz.course?.title?.toLowerCase().includes(searchStr)
        );
    });

    return (
        <div className="p-6 text-slate-900 dark:text-slate-100 font-sans space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-[17px] font-bold text-slate-800 dark:text-slate-100">Quizzes</h1>
                    <p className="text-xs text-slate-500 mt-1">Manage standalone assessments for your courses</p>
                </div>
            </div>

            <Card className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900">
                <CardHeader className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-x-2">
                            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                    <DialogHeader>
                                        <DialogTitle>Create New Quiz</DialogTitle>
                                        <DialogDescription>
                                            Create a standalone quiz and assign it to a course.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Quiz Title</label>
                                            <Input
                                                placeholder="e.g. Final Assessment"
                                                value={newQuizTitle}
                                                onChange={(e) => setNewQuizTitle(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Assign to Course</label>
                                            <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select course..." />
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
                                        <Button onClick={onCreateQuiz} disabled={isSubmitting} className="bg-slate-900 text-white">
                                            {isSubmitting ? "Creating..." : "Create Quiz"}
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
                            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-600 dark:group-focus-within:text-slate-300 transition-colors" />
                            <Input
                                placeholder="Search by title or course..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-8 w-64 pl-9 bg-slate-50 dark:bg-slate-800 border-none text-[13px] focus-visible:ring-1 focus-visible:ring-slate-200 dark:focus-visible:ring-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                <TableHead className="pl-6 font-bold text-slate-400 dark:text-slate-500 text-[11px] uppercase tracking-tighter">Quiz Title</TableHead>
                                <TableHead className="font-bold text-slate-400 dark:text-slate-500 text-[11px] uppercase tracking-tighter">Course / Lesson</TableHead>
                                <TableHead className="font-bold text-slate-400 dark:text-slate-500 text-[11px] uppercase tracking-tighter text-center">Questions</TableHead>
                                <TableHead className="font-bold text-slate-400 dark:text-slate-500 text-[11px] uppercase tracking-tighter">Created</TableHead>
                                <TableHead className="text-right pr-6 font-bold text-slate-400 dark:text-slate-500 text-[11px] uppercase tracking-tighter">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredQuizzes.map((quiz) => (
                                <TableRow key={quiz.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-200 dark:border-slate-800 last:border-0">
                                    <TableCell className="pl-6 h-14">
                                        <div className="flex items-center gap-x-3">
                                            <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                                <CheckCircle className="h-4 w-4" />
                                            </div>
                                            <span className="font-medium text-[13px] text-slate-700 dark:text-slate-200">{quiz.title}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="h-14">
                                        <div className="flex flex-col">
                                            <span className="text-[13px] font-medium text-slate-600 dark:text-slate-400">
                                                {quiz.lesson?.course?.title || quiz.course?.title || "No Course"}
                                            </span>
                                            {quiz.lesson && (
                                                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                                                    Part of: {quiz.lesson.title}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center h-14">
                                        <Badge variant="secondary" className="bg-slate-100 text-[10px] font-bold uppercase tracking-tight dark:bg-slate-800 dark:text-slate-300">
                                            {quiz._count?.questions || 0} QUESTS
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="h-14 text-[12px] text-slate-500 dark:text-slate-400 font-medium">
                                        {format(new Date(quiz.createdAt), "MMM d, yyyy")}
                                    </TableCell>
                                    <TableCell className="text-right pr-6 h-14">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900 dark:hover:text-slate-200">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="text-[13px] font-medium min-w-[140px]">
                                                <DropdownMenuItem onClick={() => router.push(`/instructor/quizzes/${quiz.id}`)}>
                                                    <Pencil className="h-3.5 w-3.5 mr-2" />
                                                    Edit Content
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-destructive focus:text-destructive"
                                                    onClick={() => onDelete(quiz.id)}
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
                    {(filteredQuizzes.length === 0 || isLoading) && (
                        <div className="text-center py-24 text-slate-400 flex flex-col items-center gap-y-2">
                            <LayoutGrid className="h-10 w-10 text-slate-100 dark:text-slate-800" />
                            <p className="text-[13px] font-medium">
                                {isLoading ? "Loading quizzes..." : "No quizzes found."}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="flex items-center justify-center gap-x-2 pt-4">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 dark:text-slate-500 border bg-white dark:bg-slate-900 dark:border-slate-800 shadow-sm"><ChevronLeft className="h-4 w-4" /></Button>
                {[1].map(p => (
                    <Button key={p} variant={p === 1 ? "default" : "ghost"} className={`h-8 w-10 text-[12px] font-bold border dark:border-slate-800 ${p === 1 ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm" : "bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 shadow-sm"}`}>{p}</Button>
                ))}
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 dark:text-slate-500 border bg-white dark:bg-slate-900 dark:border-slate-800 shadow-sm"><ChevronRight className="h-4 w-4" /></Button>
            </div>
        </div>
    );
};

export default InstructorQuizzesPage;
