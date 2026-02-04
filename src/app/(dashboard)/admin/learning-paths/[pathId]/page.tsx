"use client";

import { useEffect, useState, useTransition } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
    ChevronLeft, Save, Trash2,
    Plus, Search, MoreVertical,
    X, ArrowUpDown, BookOpen,
    Users, LayoutGrid, BarChart3,
    ArrowRight, Award, Gamepad2, ScrollText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    getLearningPathById,
    updateLearningPath,
    addCourseToPath,
    removeCourseFromPath,
    enrollUserInPath,
    unenrollUserFromPath,
    assignGroupToPath,
    unassignGroupFromPath,
    updatePathLevelRules,
    getGroups
} from "@/actions/learning-path";
import { getCategories } from "@/actions/category";
import { getAdminCourses } from "@/actions/admin";
import { getUsers } from "@/actions/user";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { UserRole } from "@prisma/client";

const LearningPathDetailPage = () => {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathId = params.pathId as string;
    const initialTab = searchParams.get("tab") || "basic-info";

    const [path, setPath] = useState<any>(null);
    const [categories, setCategories] = useState<any[]>([]);
    const [allCourses, setAllCourses] = useState<any[]>([]);
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [allGroups, setAllGroups] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPending, startTransition] = useTransition();

    // Stats for Slug Generation
    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [isSlugEdited, setIsSlugEdited] = useState(false);

    useEffect(() => {
        fetchData();
    }, [pathId]);

    const fetchData = async () => {
        setIsLoading(true);
        const [pathData, categoriesData, coursesData, groupsData, usersData] = await Promise.all([
            getLearningPathById(pathId),
            getCategories(),
            getAdminCourses(),
            getGroups(),
            getUsers(UserRole.STUDENT)
        ]);

        setPath(pathData);
        if (pathData) {
            setTitle(pathData.title);
            setSlug(pathData.slug || "");
        }
        setCategories(categoriesData);
        setAllCourses(coursesData);
        setAllGroups(groupsData);
        setAllUsers(usersData);
        setIsLoading(false);
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        setTitle(newTitle);
        if (!isSlugEdited) {
            const newSlug = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
            setSlug(newSlug);
        }
    };

    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSlug(e.target.value);
        setIsSlugEdited(true);
    };

    if (isLoading) return <div className="p-6 text-center text-[13px] text-slate-500 font-sans">Loading path details...</div>;
    if (!path) return <div className="p-6 text-center text-[13px] text-slate-500 font-sans">Path not found.</div>;

    const onUpdateBasicInfo = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const values = {
            title: formData.get("title") as string,
            slug: formData.get("slug") as string,
            categoryId: formData.get("categoryId") as string,
            description: formData.get("description") as string,
            isActive: formData.get("isActive") === "on",
            hideFromCatalog: formData.get("hideFromCatalog") === "on",
            pathCode: formData.get("pathCode") as string,
            price: parseFloat(formData.get("price") as string) || 0,
            capacity: parseInt(formData.get("capacity") as string) || 0,
            level: formData.get("level") as string,
            // New Fields
            introVideoUrl: formData.get("introVideoUrl") as string,
            hasCertificate: formData.get("hasCertificate") === "on",
            estimatedMinutes: parseInt(formData.get("estimatedMinutes") as string) || 0,
            scheduleType: formData.get("scheduleType") as string,
        };

        const result = await updateLearningPath(pathId, values);
        if (result) {
            toast.success("Path updated successfully");
            fetchData();
        } else {
            toast.error("Failed to update path");
        }
    };

    const onSaveGamification = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        startTransition(async () => {
            const formData = new FormData(e.currentTarget);
            const gamificationData = {
                points: {
                    login: formData.get("points_login"),
                    unit: formData.get("points_unit"),
                    course: formData.get("points_course"),
                },
                badges: {
                    activity: formData.get("badges_activity") === "on",
                    learning: formData.get("badges_learning") === "on",
                },
                levels: {
                    threshold: formData.get("level_threshold"),
                }
            };

            const result = await updateLearningPath(pathId, { gamification: gamificationData });
            if (result) toast.success("Gamification rules saved");
            else toast.error("Failed to save rules");
        });
    };

    const onSaveRules = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        startTransition(async () => {
            const formData = new FormData(e.currentTarget);
            const ruleData = {
                name: formData.get("rule_name"),
                trigger: formData.get("rule_trigger")
            };

            // Append to existing rules or replace? Assuming replace for now
            const result = await updateLearningPath(pathId, { rules: [ruleData] });
            if (result) toast.success("Automation rule saved");
            else toast.error("Failed to save rule");
        });
    };

    return (
        <div className="p-6 space-y-6 bg-[#f8fafc] min-h-screen font-sans">
            {/* Top Navigation */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-x-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push("/admin/learning-paths")}
                        className="h-9 w-9 bg-white border border-slate-200 shadow-sm rounded-lg"
                    >
                        <ChevronLeft className="h-4 w-4 text-slate-600" />
                    </Button>
                    <div>
                        <h1 className="text-[18px] font-bold text-slate-900 tracking-tight">Learning Pathways</h1>
                        <p className="text-[12px] text-slate-500 font-medium">Path ID: <span className="text-slate-400 font-mono uppercase">{path.id.slice(0, 8)}</span></p>
                    </div>
                </div>
            </div>

            {/* Main Content with Tabs */}
            <Tabs defaultValue={initialTab} className="space-y-8">
                <TabsList className="bg-transparent p-0 h-auto gap-x-8 border-b border-slate-200 w-full justify-start rounded-none shadow-none">
                    <TabsTrigger value="basic-info" className="flex items-center gap-2 h-10 px-0 pb-3 text-[13px] font-bold text-slate-500 data-[state=active]:text-slate-900 border-b-2 border-transparent data-[state=active]:border-slate-900 rounded-none bg-transparent shadow-none hover:text-slate-700 transition-colors">
                        Basic Info
                    </TabsTrigger>
                    <TabsTrigger value="content" className="flex items-center gap-2 h-10 px-0 pb-3 text-[13px] font-bold text-slate-500 data-[state=active]:text-slate-900 border-b-2 border-transparent data-[state=active]:border-slate-900 rounded-none bg-transparent shadow-none hover:text-slate-700 transition-colors">
                        Path Content
                        <Badge className="h-5 bg-slate-100 text-slate-600 hover:bg-slate-200">{path.courses.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="learners" className="flex items-center gap-2 h-10 px-0 pb-3 text-[13px] font-bold text-slate-500 data-[state=active]:text-slate-900 border-b-2 border-transparent data-[state=active]:border-slate-900 rounded-none bg-transparent shadow-none hover:text-slate-700 transition-colors">
                        Learners
                        <Badge className="h-5 bg-slate-100 text-slate-600 hover:bg-slate-200">{path.enrollments.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="groups" className="flex items-center gap-2 h-10 px-0 pb-3 text-[13px] font-bold text-slate-500 data-[state=active]:text-slate-900 border-b-2 border-transparent data-[state=active]:border-slate-900 rounded-none bg-transparent shadow-none hover:text-slate-700 transition-colors">
                        Groups
                        <Badge className="h-5 bg-slate-100 text-slate-600 hover:bg-slate-200">{path.assignedGroups.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="progression" className="flex items-center gap-2 h-10 px-0 pb-3 text-[13px] font-bold text-slate-500 data-[state=active]:text-slate-900 border-b-2 border-transparent data-[state=active]:border-slate-900 rounded-none bg-transparent shadow-none hover:text-slate-700 transition-colors">
                        Progression Rules
                    </TabsTrigger>
                    {/* New Tabs Triggers */}
                    <TabsTrigger value="badges" className="flex items-center gap-2 h-10 px-0 pb-3 text-[13px] font-bold text-slate-500 data-[state=active]:text-slate-900 border-b-2 border-transparent data-[state=active]:border-slate-900 rounded-none bg-transparent shadow-none hover:text-slate-700 transition-colors">
                        Badges
                    </TabsTrigger>
                    <TabsTrigger value="gamification" className="flex items-center gap-2 h-10 px-0 pb-3 text-[13px] font-bold text-slate-500 data-[state=active]:text-slate-900 border-b-2 border-transparent data-[state=active]:border-slate-900 rounded-none bg-transparent shadow-none hover:text-slate-700 transition-colors">
                        Gamification
                    </TabsTrigger>
                    <TabsTrigger value="rules" className="flex items-center gap-2 h-10 px-0 pb-3 text-[13px] font-bold text-slate-500 data-[state=active]:text-slate-900 border-b-2 border-transparent data-[state=active]:border-slate-900 rounded-none bg-transparent shadow-none hover:text-slate-700 transition-colors">
                        Rules
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="basic-info" className="mt-0 focus-visible:ring-0">
                    <form onSubmit={onUpdateBasicInfo} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Info */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-8">
                                <div className="space-y-1">
                                    <h3 className="text-[15px] font-bold text-slate-900">General Information</h3>
                                    <p className="text-[13px] text-slate-500">Basic details about this learning path.</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[13px] font-bold text-slate-700 ml-1">Path Title</label>
                                        <Input name="title" value={title} onChange={handleTitleChange} className="h-11 bg-slate-50/50 border-slate-100 text-[13px] focus-visible:ring-slate-200" required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[13px] font-bold text-slate-700 ml-1">Friendly URL (Slug)</label>
                                        <Input name="slug" value={slug} onChange={handleSlugChange} className="h-11 bg-slate-50/50 border-slate-100 text-[13px] focus-visible:ring-slate-200" placeholder="e.g. web-dev-path" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[13px] font-bold text-slate-700 ml-1">Category</label>
                                        <Select name="categoryId" defaultValue={path.categoryId || ""}>
                                            <SelectTrigger className="h-11 bg-slate-50/50 border-slate-100 text-[13px] focus-visible:ring-slate-200">
                                                <SelectValue placeholder="Select Category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((c) => (
                                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-4 pt-8">
                                        <div className="flex items-center gap-x-3">
                                            <Switch name="isActive" defaultChecked={path.isActive} />
                                            <span className="text-[13px] font-medium text-slate-700">Active Status</span>
                                        </div>
                                        <div className="flex items-center gap-x-3">
                                            <Switch name="hideFromCatalog" defaultChecked={path.hideFromCatalog} />
                                            <span className="text-[13px] font-medium text-slate-700">Hide from Catalog</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[13px] font-bold text-slate-700 ml-1">Description</label>
                                    <Textarea name="description" defaultValue={path.description || ""} className="min-h-[150px] bg-slate-50/50 border-slate-100 text-[13px] focus-visible:ring-slate-200 resize-none p-4" />
                                </div>
                            </div>
                        </div>

                        {/* Additional Info / Side Panel */}
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                                <div className="space-y-1">
                                    <h3 className="text-[14px] font-bold text-slate-900">Path Configuration</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[12px] font-bold text-slate-700 ml-1">Path Code</label>
                                        <Input name="pathCode" defaultValue={path.pathCode || ""} className="h-10 bg-slate-50 border-slate-100" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[12px] font-bold text-slate-700 ml-1">Price ($)</label>
                                        <Input name="price" type="number" step="0.01" defaultValue={path.price || 0} className="h-10 bg-slate-50 border-slate-100" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[12px] font-bold text-slate-700 ml-1">Intro Video URL</label>
                                        <Input name="introVideoUrl" defaultValue={path.introVideoUrl || ""} className="h-10 bg-slate-50 border-slate-100" placeholder="https://..." />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[12px] font-bold text-slate-700 ml-1">Capacity Limit</label>
                                        <Input name="capacity" type="number" defaultValue={path.capacity || 0} className="h-10 bg-slate-50 border-slate-100" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[12px] font-bold text-slate-700 ml-1">Est. Minutes</label>
                                            <Input name="estimatedMinutes" type="number" defaultValue={path.estimatedMinutes || 0} className="h-10 bg-slate-50 border-slate-100" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[12px] font-bold text-slate-700 ml-1">Schedule</label>
                                            <Select name="scheduleType" defaultValue={path.scheduleType || "Self Paced"}>
                                                <SelectTrigger className="h-10 bg-slate-50 border-slate-100 text-[12px]">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Self Paced">Self Paced</SelectItem>
                                                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between py-2 border-t border-slate-50">
                                        <span className="text-[13px] font-medium text-slate-600">Certificate</span>
                                        <Switch name="hasCertificate" defaultChecked={path.hasCertificate} />
                                    </div>
                                    <div className="space-y-2 pt-2 border-t border-slate-50">
                                        <label className="text-[12px] font-bold text-slate-700 ml-1">Difficulty Level</label>
                                        <Select name="level" defaultValue={path.level || "Beginner"}>
                                            <SelectTrigger className="h-10 bg-slate-50 border-slate-100 text-[12px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Beginner">Beginner</SelectItem>
                                                <SelectItem value="Intermediate">Intermediate</SelectItem>
                                                <SelectItem value="Advanced">Advanced</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <Button className="w-full bg-slate-900 text-white hover:bg-slate-800 h-10 rounded-xl" disabled={isPending}>
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Changes
                                </Button>
                            </div>
                        </div>
                    </form>
                </TabsContent>

                <TabsContent value="content" className="mt-0 focus-visible:ring-0">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="text-[14px] font-bold text-slate-900">Included Courses</h3>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button size="sm" className="h-9 px-4 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm text-[12px] font-bold rounded-lg">
                                        <Plus className="h-3.5 w-3.5 mr-2" />
                                        Add Course
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle className="text-lg font-bold">Add Course to Path</DialogTitle>
                                    </DialogHeader>
                                    <div className="pt-4 space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                            <Input placeholder="Search courses..." className="pl-9 h-10 bg-slate-50 border-slate-200 rounded-xl text-[13px]" />
                                        </div>
                                        <div className="grid grid-cols-1 gap-3">
                                            {allCourses.filter(c => !path.courses.some((pc: any) => pc.courseId === c.id)).map((course) => (
                                                <div key={course.id} className="group flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm transition-all">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                                                            <BookOpen className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[13px] font-bold text-slate-900">{course.title}</p>
                                                            <p className="text-[11px] text-slate-400">ID: {course.id.slice(0, 8)}</p>
                                                        </div>
                                                    </div>
                                                    <Button size="sm" className="bg-slate-900 text-white hover:bg-slate-800 h-8 px-4 text-[12px] font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" onClick={async () => {
                                                        await addCourseToPath(pathId, course.id);
                                                        fetchData();
                                                        toast.success("Course added");
                                                    }}>Add</Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    {allCourses.length === 0 && <p className="text-center text-sm text-slate-500 py-4">No courses available.</p>}
                                </DialogContent>
                            </Dialog>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/50 border-slate-100 hover:bg-slate-50/50">
                                    <TableHead className="w-[80px] text-[11px] font-bold uppercase tracking-wider text-slate-400 pl-6 h-10">Order</TableHead>
                                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-400 h-10">Course Name</TableHead>
                                    <TableHead className="w-[100px] text-[11px] font-bold uppercase tracking-wider text-slate-400 h-10">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {path.courses.sort((a: any, b: any) => a.position - b.position).map((item: any, index: number) => (
                                    <TableRow key={item.id} className="border-slate-50 hover:bg-slate-50/50">
                                        <TableCell className="pl-6 font-medium text-slate-600 text-[13px]">{index + 1}</TableCell>
                                        <TableCell className="font-medium text-slate-900 text-[13px]">{item.course.title}</TableCell>
                                        <TableCell>
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50" onClick={async () => {
                                                await removeCourseFromPath(pathId, item.courseId);
                                                fetchData();
                                                toast.success("Course removed");
                                            }}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {path.courses.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-32 text-center text-[13px] text-slate-500">
                                            No courses added yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>

                <TabsContent value="learners" className="mt-0 focus-visible:ring-0">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="text-[14px] font-bold text-slate-900">Enrolled Learners</h3>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button size="sm" className="h-9 px-4 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm text-[12px] font-bold rounded-lg">
                                        <Users className="h-3.5 w-3.5 mr-2" />
                                        Enroll User
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle className="text-lg font-bold">Enroll User</DialogTitle>
                                    </DialogHeader>
                                    <div className="pt-4 space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                            <Input placeholder="Search users by name or email..." className="pl-9 h-10 bg-slate-50 border-slate-200 rounded-xl text-[13px]" />
                                        </div>
                                        <div className="grid grid-cols-1 gap-3">
                                            {allUsers.filter(u => !path.enrollments.some((e: any) => e.userId === u.id)).map((user) => (
                                                <div key={user.id} className="group flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm transition-all">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-9 w-9 border border-slate-200">
                                                            <AvatarImage src={user.image} />
                                                            <AvatarFallback className="text-[11px] bg-slate-100 text-slate-500 font-bold">{user.name?.[0]}</AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex flex-col">
                                                            <span className="text-[13px] font-bold text-slate-900">{user.name}</span>
                                                            <span className="text-[11px] text-slate-400">{user.email}</span>
                                                        </div>
                                                    </div>
                                                    <Button size="sm" className="bg-slate-900 text-white hover:bg-slate-800 h-8 px-4 text-[12px] font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" onClick={async () => {
                                                        await enrollUserInPath(pathId, user.id);
                                                        fetchData();
                                                        toast.success("User enrolled");
                                                    }}>Enroll</Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/50 border-slate-100 hover:bg-slate-50/50">
                                    <TableHead className="pl-6 h-10 text-[11px] font-bold uppercase tracking-wider text-slate-400">Student</TableHead>
                                    <TableHead className="h-10 text-[11px] font-bold uppercase tracking-wider text-slate-400">Enrolled Date</TableHead>
                                    <TableHead className="h-10 text-[11px] font-bold uppercase tracking-wider text-slate-400">Progress</TableHead>
                                    <TableHead className="h-10 text-[11px] font-bold uppercase tracking-wider text-slate-400 w-[100px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {path.enrollments.map((enrollment: any) => (
                                    <TableRow key={enrollment.id} className="border-slate-50 hover:bg-slate-50/50">
                                        <TableCell className="pl-6">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8 border border-slate-200">
                                                    <AvatarImage src={enrollment.user.image} />
                                                    <AvatarFallback className="text-[10px] bg-slate-100 text-slate-500">{enrollment.user.name?.[0]}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="text-[13px] font-bold text-slate-700">{enrollment.user.name}</span>
                                                    <span className="text-[11px] text-slate-400">{enrollment.user.email}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-[13px] text-slate-600 font-medium">
                                            {enrollment.createdAt ? format(new Date(enrollment.createdAt), "MMM d, yyyy") : "-"}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${enrollment.progress || 0}%` }}></div>
                                                </div>
                                                <span className="text-[11px] font-bold text-slate-600">{enrollment.progress || 0}%</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50" onClick={async () => {
                                                await unenrollUserFromPath(pathId, enrollment.userId);
                                                fetchData();
                                                toast.success("User unenrolled");
                                            }}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {path.enrollments.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-32 text-center text-[13px] text-slate-500">
                                            No learners enrolled yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>

                <TabsContent value="groups" className="mt-0 focus-visible:ring-0">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="text-[14px] font-bold text-slate-900">Assigned Groups</h3>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button size="sm" className="h-9 px-4 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm text-[12px] font-bold rounded-lg">
                                        <Users className="h-3.5 w-3.5 mr-2" />
                                        Assign Group
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle className="text-lg font-bold">Assign Group</DialogTitle>
                                    </DialogHeader>
                                    <div className="pt-4 space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                            <Input placeholder="Search groups..." className="pl-9 h-10 bg-slate-50 border-slate-200 rounded-xl text-[13px]" />
                                        </div>
                                        <div className="grid grid-cols-1 gap-3">
                                            {allGroups.filter(g => !path.assignedGroups.some((ag: any) => ag.groupId === g.id)).map((group) => (
                                                <div key={group.id} className="group flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm transition-all">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center border border-indigo-100">
                                                            <Users className="h-4 w-4 text-indigo-500 group-hover:text-indigo-600 transition-colors" />
                                                        </div>
                                                        <div>
                                                            <span className="text-[13px] font-bold text-slate-900 block">{group.name}</span>
                                                            <span className="text-[11px] text-slate-400">{group.users?.length || 0} Members</span>
                                                        </div>
                                                    </div>
                                                    <Button size="sm" className="bg-slate-900 text-white hover:bg-slate-800 h-8 px-4 text-[12px] font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" onClick={async () => {
                                                        await assignGroupToPath(pathId, group.id);
                                                        fetchData();
                                                        toast.success("Group assigned");
                                                    }}>Assign</Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/50 border-slate-100 hover:bg-slate-50/50">
                                    <TableHead className="pl-6 h-10 text-[11px] font-bold uppercase tracking-wider text-slate-400">Group Name</TableHead>
                                    <TableHead className="h-10 text-[11px] font-bold uppercase tracking-wider text-slate-400">Members</TableHead>
                                    <TableHead className="h-10 text-[11px] font-bold uppercase tracking-wider text-slate-400 w-[100px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {path.assignedGroups.map((assignment: any) => (
                                    <TableRow key={assignment.id} className="border-slate-50 hover:bg-slate-50/50">
                                        <TableCell className="pl-6 font-medium text-slate-700 text-[13px]">{assignment.group.name}</TableCell>
                                        <TableCell className="text-[13px] text-slate-600 font-medium">
                                            <Badge variant="secondary" className="bg-slate-100 text-slate-500 font-normal">{assignment.group.users?.length || 0} Members</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50" onClick={async () => {
                                                await unassignGroupFromPath(pathId, assignment.groupId);
                                                fetchData();
                                                toast.success("Group unassigned");
                                            }}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {path.assignedGroups.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-32 text-center text-[13px] text-slate-500">
                                            No groups assigned yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>

                <TabsContent value="progression" className="mt-0 focus-visible:ring-0">
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="mb-6 space-y-1">
                            <h3 className="text-[14px] font-bold text-slate-900">Level Progression Rules</h3>
                            <p className="text-[12px] text-slate-500">Define how learners advance through levels.</p>
                        </div>
                        <form action={async (formData) => {
                            const completedCourses = parseInt(formData.get("coursesCount") as string) || 0;
                            const badgesEarned = parseInt(formData.get("badges") as string) || 0;
                            await updatePathLevelRules(pathId, { coursesThreshold: completedCourses, badgesThreshold: badgesEarned });
                            toast.success("Rules saved");
                            fetchData();
                        }} className="space-y-4">
                            <div className="flex items-center gap-x-6 p-4 rounded-2xl bg-slate-50/50 border border-slate-100 group transition-all hover:border-slate-200">
                                <div className="h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center font-bold text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
                                    C
                                </div>
                                <div className="flex-1 flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <p className="text-[13px] font-bold text-slate-700">Course Completion</p>
                                        <p className="text-[11px] text-slate-400 font-medium">Upgrade level every X courses</p>
                                    </div>
                                    <Input name="coursesCount" type="number" defaultValue={path.levelRules?.coursesThreshold || 5} className="w-24 h-10 text-center font-bold text-[13px] bg-white border-slate-200 rounded-lg" />
                                </div>
                            </div>

                            <div className="flex items-center gap-x-6 p-4 rounded-2xl bg-slate-50/50 border border-slate-100 group transition-all hover:border-slate-200">
                                <div className="h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center font-bold text-amber-600 shadow-sm group-hover:scale-110 transition-transform">
                                    B
                                </div>
                                <div className="flex-1 flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <p className="text-[13px] font-bold text-slate-700">Badge Accumulation</p>
                                        <p className="text-[11px] text-slate-400 font-medium">Upgrade level every X badges</p>
                                    </div>
                                    <Input name="badges" type="number" defaultValue={path.levelRules?.badgesThreshold || 5} className="w-24 h-10 text-center font-bold text-[13px] bg-white border-slate-200 rounded-lg" />
                                </div>
                            </div>

                            <div className="flex items-center gap-x-4 pt-4">
                                <Button type="button" variant="outline" className="flex-1 h-12 text-[14px] font-bold rounded-xl border-slate-200 text-slate-600" onClick={() => router.refresh()}>Cancel</Button>
                                <Button type="submit" className="flex-[2] h-12 bg-slate-900 hover:bg-slate-800 text-white text-[14px] font-bold rounded-xl transition-all shadow-lg shadow-slate-200">Save Progression Rules</Button>
                            </div>
                        </form>
                    </div>
                </TabsContent>
                <TabsContent value="badges" className="mt-0 focus-visible:ring-0">
                    <div className="space-y-8 bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                        {/* Activity Badges */}
                        <div className="space-y-4">
                            <h3 className="text-[14px] font-bold text-slate-900">Activity Badges</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="flex flex-col items-center gap-2 group cursor-pointer">
                                        <div className="h-24 w-24 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 group-hover:border-slate-400 transition-colors flex items-center justify-center">
                                            <Award className="h-8 w-8 text-slate-300 group-hover:text-slate-500 transition-colors" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[12px] font-bold text-slate-700">Activity Newbie</p>
                                            <p className="text-[11px] text-slate-400">(4 logins)</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Learning Badges */}
                        <div className="space-y-4">
                            <h3 className="text-[14px] font-bold text-slate-900">Learning Badges</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={`l-${i}`} className="flex flex-col items-center gap-2 group cursor-pointer">
                                        <div className="h-24 w-24 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 group-hover:border-slate-400 transition-colors flex items-center justify-center">
                                            <BookOpen className="h-8 w-8 text-slate-300 group-hover:text-slate-500 transition-colors" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[12px] font-bold text-slate-700">Learning Pro</p>
                                            <p className="text-[11px] text-slate-400">(10 courses)</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="gamification" className="mt-0 focus-visible:ring-0">
                    <form onSubmit={onSaveGamification} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-8">
                        {/* Points Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[14px] font-bold text-slate-900">Points</h3>
                                <Switch defaultChecked={true} />
                            </div>
                            <div className="space-y-3 pl-2">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 min-w-[200px]">
                                        <input type="checkbox" className="rounded border-slate-300" />
                                        <span className="text-[13px] text-slate-600">Each login gives</span>
                                    </div>
                                    <Input name="points_login" defaultValue="25" className="h-8 w-20 text-center text-[12px]" />
                                    <Badge variant="secondary" className="bg-slate-100 text-slate-500 font-normal">Points</Badge>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 min-w-[200px]">
                                        <input type="checkbox" className="rounded border-slate-300" />
                                        <span className="text-[13px] text-slate-600">Each unit completion</span>
                                    </div>
                                    <Input name="points_unit" defaultValue="25" className="h-8 w-20 text-center text-[12px]" />
                                    <Badge variant="secondary" className="bg-slate-100 text-slate-500 font-normal">Points</Badge>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 min-w-[200px]">
                                        <input type="checkbox" className="rounded border-slate-300" />
                                        <span className="text-[13px] text-slate-600">Each course completion</span>
                                    </div>
                                    <Input name="points_course" defaultValue="150" className="h-8 w-20 text-center text-[12px]" />
                                    <Badge variant="secondary" className="bg-slate-100 text-slate-500 font-normal">Points</Badge>
                                </div>
                            </div>
                        </div>

                        {/* Badges Section */}
                        <div className="space-y-4 pt-4 border-t border-slate-100">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[14px] font-bold text-slate-900">Badges</h3>
                                <Switch />
                            </div>
                            <div className="space-y-2 pl-2">
                                <div className="flex items-center gap-2">
                                    <input name="badges_activity" type="checkbox" className="rounded border-slate-300" />
                                    <span className="text-[13px] text-slate-600">Activity badges (4, 8, 16, 32 logins)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input name="badges_learning" type="checkbox" className="rounded border-slate-300" />
                                    <span className="text-[13px] text-slate-600">Learning badges (1, 2, 4, 8 courses)</span>
                                </div>
                            </div>
                        </div>

                        {/* Levels Section */}
                        <div className="space-y-4 pt-4 border-t border-slate-100">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[14px] font-bold text-slate-900">Levels</h3>
                                <Switch />
                            </div>
                            <div className="space-y-3 pl-2">
                                <div className="flex items-center gap-4">
                                    <input type="checkbox" className="rounded border-slate-300" />
                                    <span className="text-[13px] text-slate-600 min-w-[140px]">Upgrade level every</span>
                                    <Input name="level_threshold" defaultValue="3000" className="h-8 w-20 text-center text-[12px]" />
                                    <Badge variant="secondary" className="bg-slate-100 text-slate-500 font-normal">Points</Badge>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" className="h-10 px-6 rounded-xl border-slate-200">Cancel</Button>
                            <Button type="submit" className="h-10 px-6 bg-slate-900 text-white rounded-xl hover:bg-slate-800">Save Rules</Button>
                        </div>
                    </form>
                </TabsContent>

                <TabsContent value="rules" className="mt-0 focus-visible:ring-0">
                    <form onSubmit={onSaveRules} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                        <div className="space-y-1">
                            <h3 className="text-[15px] font-bold text-slate-900">Automation</h3>
                        </div>
                        <div className="max-w-xl space-y-6">
                            <div className="space-y-2">
                                <label className="text-[13px] font-bold text-slate-700 ml-1">Name</label>
                                <Input name="rule_name" className="h-11 bg-slate-50/50 border-slate-100 text-[13px]" placeholder="Rule Name" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[13px] font-bold text-slate-700 ml-1">Automation</label>
                                <Select name="rule_trigger">
                                    <SelectTrigger className="h-11 bg-slate-50/50 border-slate-100 text-[13px]">
                                        <SelectValue placeholder="Select Trigger" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="enroll">When user enrolls</SelectItem>
                                        <SelectItem value="complete">When user completes path</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex justify-start gap-3 pt-2">
                            <Button type="button" variant="outline" className="h-10 px-6 rounded-xl border-slate-200">Cancel</Button>
                            <Button type="submit" className="h-10 px-6 bg-slate-900 text-white rounded-xl hover:bg-slate-800">Save</Button>
                        </div>
                    </form>
                </TabsContent>
            </Tabs>
        </div >
    );
};

export default LearningPathDetailPage;
