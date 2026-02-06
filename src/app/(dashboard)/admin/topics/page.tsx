"use client";

import { useEffect, useState } from "react";
import {
    FileText,
    Search,
    Plus,
    Filter,
    ArrowUpDown,
    MoreVertical,
    Pencil,
    Trash2,
    Video,
    File,
    ChevronLeft,
    ChevronRight,
    LayoutGrid,
    CheckCircle
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

import { getAdminTopics, getAdminLessons } from "@/actions/curriculum";
import { getAdminCourses } from "@/actions/admin";
import { createTopic, deleteTopic } from "@/actions/lesson";

const AdminTopicsPage = () => {
    const router = useRouter();
    const [topics, setTopics] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [allLessons, setAllLessons] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Create Dialog State
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [newTopicTitle, setNewTopicTitle] = useState("");
    const [newTopicType, setNewTopicType] = useState<"VIDEO" | "TEXT" | "PDF" | "QUIZ">("VIDEO");
    const [selectedCourseId, setSelectedCourseId] = useState("");
    const [selectedLessonId, setSelectedLessonId] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [topicsData, coursesData, lessonsData] = await Promise.all([
                getAdminTopics(),
                getAdminCourses(),
                getAdminLessons()
            ]);
            setTopics(topicsData);
            setCourses(coursesData);
            setAllLessons(lessonsData);
        } catch (error) {
            toast.error("Failed to fetch data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredLessons = allLessons.filter(l => l.courseId === selectedCourseId);

    const onCreateTopic = async () => {
        if (!newTopicTitle || !selectedLessonId) {
            toast.error("Please fill in all fields");
            return;
        }

        try {
            setIsSubmitting(true);

            // If type is QUIZ, we create a quiz first, then creating topic might be handled differently 
            // OR createTopic action supports QUIZ type now? 
            // We need to update createTopic in lesson.ts OR handle it here.
            // Let's assume createTopic handles it, but we might want to redirect to Quiz Editor.
            // Actually, best flow: Create Topic (Type Quiz) -> Backend creates empty Quiz & links it -> Redirect to Quiz Editor.

            const newTopic = await createTopic(selectedLessonId, newTopicTitle, newTopicType);

            toast.success("Topic created");
            setIsCreateDialogOpen(false);
            setNewTopicTitle("");
            setSelectedLessonId(""); // Keep course selected for convenience?

            if (newTopicType === "QUIZ" && newTopic?.quizId) {
                router.push(`/admin/quizzes/${newTopic.quizId}`);
            } else {
                fetchData();
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    const onDeleteTopic = async (id: string) => {
        if (!confirm("Are you sure you want to delete this topic?")) return;

        try {
            await deleteTopic(id);
            toast.success("Topic deleted");
            fetchData();
        } catch (error) {
            toast.error("Something went wrong");
        }
    };

    const filteredTopics = topics.filter((topic) => {
        const searchStr = searchQuery.toLowerCase();
        return (
            topic.title?.toLowerCase().includes(searchStr) ||
            topic.lesson?.title?.toLowerCase().includes(searchStr) ||
            topic.lesson?.course?.title?.toLowerCase().includes(searchStr)
        );
    });

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "VIDEO": return <Video className="h-4 w-4 text-rose-500" />;
            case "PDF": return <File className="h-4 w-4 text-blue-500" />;
            case "QUIZ": return <CheckCircle className="h-4 w-4 text-amber-500" />;
            default: return <FileText className="h-4 w-4 text-slate-500" />;
        }
    };

    return (
        <div className="p-6 text-black font-sans space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-[17px] font-bold text-slate-800">Topics</h1>
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
                                        <DialogTitle>Create New Topic</DialogTitle>
                                        <DialogDescription>
                                            Add a new topic to a specific lesson.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Topic Title</label>
                                            <Input
                                                placeholder="e.g. Getting Started"
                                                value={newTopicTitle}
                                                onChange={(e) => setNewTopicTitle(e.target.value)}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Topic Type</label>
                                                <Select value={newTopicType} onValueChange={(v: any) => setNewTopicType(v)}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="VIDEO">Video</SelectItem>
                                                        <SelectItem value="TEXT">Text</SelectItem>
                                                        <SelectItem value="PDF">PDF</SelectItem>
                                                        <SelectItem value="QUIZ">Quiz</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Select Course</label>
                                                <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Course..." />
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
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Select Lesson</label>
                                            <Select
                                                value={selectedLessonId}
                                                onValueChange={setSelectedLessonId}
                                                disabled={!selectedCourseId}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder={selectedCourseId ? "Choose lesson..." : "Select course first"} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {filteredLessons.map((lesson) => (
                                                        <SelectItem key={lesson.id} value={lesson.id}>
                                                            {lesson.title}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                                        <Button onClick={onCreateTopic} disabled={isSubmitting} className="bg-slate-900">
                                            {isSubmitting ? "Creating..." : "Create Topic"}
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
                                placeholder="Search by title, lesson or course..."
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
                                <TableHead className="pl-6 font-bold text-slate-400 text-[11px] uppercase tracking-tighter">Topic Title</TableHead>
                                <TableHead className="font-bold text-slate-400 text-[11px] uppercase tracking-tighter">Parent Lesson</TableHead>
                                <TableHead className="font-bold text-slate-400 text-[11px] uppercase tracking-tighter">Course</TableHead>
                                <TableHead className="font-bold text-slate-400 text-[11px] uppercase tracking-tighter text-center">Type</TableHead>
                                <TableHead className="text-right pr-6 font-bold text-slate-400 text-[11px] uppercase tracking-tighter">Options</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTopics.map((topic) => (
                                <TableRow key={topic.id} className="group hover:bg-slate-50/50 transition-colors border-b last:border-0">
                                    <TableCell className="pl-6 h-14">
                                        <div className="flex items-center gap-x-3">
                                            <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center">
                                                {getTypeIcon(topic.type)}
                                            </div>
                                            <span className="font-medium text-[13px] text-slate-700">{topic.title}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="h-14 font-medium text-[13px] text-slate-600">
                                        {topic.lesson?.title || "N/A"}
                                    </TableCell>
                                    <TableCell className="h-14">
                                        <Badge variant="outline" className="text-slate-500 border-slate-200 font-normal text-[11px]">
                                            {topic.lesson?.course?.title || "N/A"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center h-14">
                                        <Badge variant="secondary" className="bg-slate-100 text-[10px] font-bold uppercase tracking-tight">
                                            {topic.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right pr-6 h-14">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="text-[13px] font-medium min-w-[140px]">
                                                <DropdownMenuItem onClick={() => router.push(`/admin/topics/${topic.id}/edit`)}>
                                                    <Pencil className="h-3.5 w-3.5 mr-2" />
                                                    Edit Topic
                                                </DropdownMenuItem>
                                                {topic.type === "QUIZ" && topic.quizId && (
                                                    <DropdownMenuItem onClick={() => router.push(`/admin/quizzes/${topic.quizId}`)}>
                                                        <CheckCircle className="h-3.5 w-3.5 mr-2" />
                                                        Edit Quiz Content
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem onClick={() => window.open(`/admin/courses/${topic.lesson?.course?.id}/edit`, '_self')}>
                                                    <FileText className="h-3.5 w-3.5 mr-2" />
                                                    View in Course
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => onDeleteTopic(topic.id)}
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
                    {(filteredTopics.length === 0 || isLoading) && (
                        <div className="text-center py-24 text-slate-400 flex flex-col items-center gap-y-2">
                            <LayoutGrid className="h-10 w-10 text-slate-100" />
                            <p className="text-[13px] font-medium">{isLoading ? "Loading topics..." : "No topics found."}</p>
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

export default AdminTopicsPage;
