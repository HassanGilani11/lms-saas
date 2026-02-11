"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import {
    getGroupById,
    updateGroup,
    addUsersToGroup,
    removeUserFromGroup,
    bulkUserUpload,
    enrollGroupInCourse,
    unenrollGroupFromCourse
} from "@/actions/groups";
import { getUsers } from "@/actions/user";
import { getGroupProgressReport } from "@/actions/group-reports";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Users,
    Network,
    UserCheck,
    BookOpen,
    BarChart3,
    ChevronLeft,
    Plus,
    MoreVertical,
    Trash2,
    Upload,
    Download,
    Mail,
    Search,
    CheckCircle2,
    XCircle,
    Loader2
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { format } from "date-fns";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";

import { getCourses } from "@/actions/course";

const AdminGroupDetailPage = ({ params }: { params: Promise<{ id: string }> }) => {
    const resolvedParams = use(params);
    const router = useRouter();
    const [group, setGroup] = useState<any>(null);
    const [report, setReport] = useState<any>(null);
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [allCourses, setAllCourses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isBulkOpen, setIsBulkOpen] = useState(false);
    const [isMemberAddOpen, setIsMemberAddOpen] = useState(false);
    const [isCourseAddOpen, setIsCourseAddOpen] = useState(false);
    const [bulkData, setBulkData] = useState("");
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [groupData, usersData, reportData, coursesData] = await Promise.all([
                getGroupById(resolvedParams.id),
                getUsers(),
                getGroupProgressReport(resolvedParams.id),
                getCourses()
            ]);

            setGroup(groupData);
            setAllUsers(usersData);
            setReport(reportData);
            setAllCourses(coursesData);
        } catch (error) {
            toast.error("Failed to fetch group data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [resolvedParams.id]);

    const handleBulkUpload = async () => {
        try {
            const lines = bulkData.split("\n").filter(l => l.trim() !== "");
            const users = lines.map(line => {
                const [email, name] = line.split(",").map(s => s.trim());
                return { email, name };
            });

            if (users.length === 0) {
                toast.error("No valid data found");
                return;
            }

            const res = await bulkUserUpload(resolvedParams.id, users);
            if (res.success) {
                toast.success(`Successfully added/updated ${res.count} users`);
                setIsBulkOpen(false);
                setBulkData("");
                fetchData();
            } else {
                toast.error(res.error || "Failed to upload users");
            }
        } catch (error) {
            toast.error("Invalid format. Use: email, name");
        }
    };

    const handleAddMembers = async () => {
        if (selectedUserIds.length === 0) return;
        const res = await addUsersToGroup(resolvedParams.id, selectedUserIds);
        if (res) {
            toast.success("Members added successfully");
            setIsMemberAddOpen(false);
            setSelectedUserIds([]);
            fetchData();
        } else {
            toast.error("Failed to add members");
        }
    };

    const handleAssignCourses = async () => {
        if (selectedCourseIds.length === 0) return;
        try {
            await Promise.all(selectedCourseIds.map(courseId =>
                enrollGroupInCourse(resolvedParams.id, courseId)
            ));
            toast.success("Courses assigned successfully");
            setIsCourseAddOpen(false);
            setSelectedCourseIds([]);
            fetchData();
        } catch (error) {
            toast.error("Failed to assign courses");
        }
    };

    const handleRemoveMember = async (userId: string) => {
        if (confirm("Remove user from group?")) {
            const res = await removeUserFromGroup(resolvedParams.id, userId);
            if (res) {
                toast.success("Member removed");
                fetchData();
            } else {
                toast.error("Failed to remove member");
            }
        }
    };


    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!group) return <div>Group not found</div>;

    return (
        <div className="h-full p-6 space-y-6">
            <div className="flex items-center gap-x-2 mb-4">
                <Button variant="ghost" onClick={() => router.push("/admin/groups")}>
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Back to Groups
                </Button>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-x-3">
                        <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
                            <Users className="h-6 w-6 text-indigo-500" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">{group.name}</h1>
                            <div className="flex items-center gap-x-2 text-slate-400 text-sm">
                                {group.category?.name && <Badge variant="secondary">{group.category.name}</Badge>}
                                {group.parent && (
                                    <span className="flex items-center gap-x-1">
                                        <Network className="h-3 w-3" />
                                        Subgroup of {group.parent.name}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-x-2">
                    <Dialog open={isBulkOpen} onOpenChange={setIsBulkOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="border-indigo-100 text-indigo-600 hover:bg-indigo-50">
                                <Upload className="h-4 w-4 mr-2" />
                                Bulk Upload
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Bulk User Upload</DialogTitle>
                                <CardDescription>
                                    Enter one user per line in format: <code className="bg-slate-100 p-1 rounded">email, name</code>
                                </CardDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <textarea
                                    className="w-full h-48 p-3 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="john@example.com, John Doe&#10;jane@example.com, Jane Smith"
                                    value={bulkData}
                                    onChange={(e) => setBulkData(e.target.value)}
                                />
                            </div>
                            <DialogFooter>
                                <Button variant="ghost" onClick={() => setIsBulkOpen(false)}>Cancel</Button>
                                <Button className="bg-slate-900 text-white" onClick={handleBulkUpload}>Upload Members</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <Dialog open={isMemberAddOpen} onOpenChange={setIsMemberAddOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-slate-900 text-white">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Member
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Add Members to Group</DialogTitle>
                                <CardDescription>Select users to add to {group.name}.</CardDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4 max-h-96 overflow-y-auto">
                                {allUsers.filter(u => !group.users?.some((gu: any) => gu.id === u.id)).map(user => (
                                    <div key={user.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-50">
                                        <Checkbox
                                            checked={selectedUserIds.includes(user.id)}
                                            onCheckedChange={(checked) => {
                                                setSelectedUserIds(prev =>
                                                    checked ? [...prev, user.id] : prev.filter(id => id !== user.id)
                                                )
                                            }}
                                        />
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={user.image || ""} />
                                            <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">{user.name}</span>
                                            <span className="text-xs text-slate-500">{user.email}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <DialogFooter>
                                <Button variant="ghost" onClick={() => setIsMemberAddOpen(false)}>Cancel</Button>
                                <Button className="bg-slate-900 text-white" onClick={handleAddMembers}>Add Selected</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Tabs defaultValue="members" className="space-y-6">
                <TabsList className="bg-slate-100 p-1">
                    <TabsTrigger value="members" className="data-[state=active]:bg-white">
                        <Users className="h-4 w-4 mr-2" />
                        Members ({group._count?.users})
                    </TabsTrigger>
                    <TabsTrigger value="courses" className="data-[state=active]:bg-white">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Enrollments
                    </TabsTrigger>
                    <TabsTrigger value="reports" className="data-[state=active]:bg-white">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Progress Report
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="data-[state=active]:bg-white">
                        <Network className="h-4 w-4 mr-2" />
                        Subgroups ({group._count?.children})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="members">
                    <Card className="border-none shadow-sm overflow-hidden">
                        <CardHeader className="bg-white border-b px-6 py-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg font-bold">Group Members</CardTitle>
                                <div className="relative">
                                    <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <Input placeholder="Search members..." className="pl-9 h-9 w-64 bg-slate-50 border-none text-sm" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50/50">
                                        <TableHead className="pl-6">User</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead className="text-center">Role</TableHead>
                                        <TableHead className="text-right pr-6">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {group.users?.map((user: any) => (
                                        <TableRow key={user.id} className="hover:bg-slate-50/50">
                                            <TableCell className="pl-6">
                                                <div className="flex items-center gap-x-3">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src={user.image || ""} />
                                                        <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="font-medium text-sm text-slate-900">{user.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-600">{user.email}</TableCell>
                                            <TableCell className="text-center">
                                                {group.leaders?.some((l: any) => l.id === user.id) ? (
                                                    <Badge className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100">
                                                        <UserCheck className="h-3 w-3 mr-1" />
                                                        Leader
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-slate-500">Member</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <Button variant="ghost" size="icon" onClick={() => handleRemoveMember(user.id)} className="text-slate-400 hover:text-red-600">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {(!group.users || group.users.length === 0) && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-10 text-slate-400">
                                                No members in this group yet.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="courses">
                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg">Assigned Courses</CardTitle>
                                    <CardDescription>Courses that all members of this group can access.</CardDescription>
                                </div>
                                <Dialog open={isCourseAddOpen} onOpenChange={setIsCourseAddOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="bg-slate-900 text-white">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Assign Course
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-md">
                                        <DialogHeader>
                                            <DialogTitle>Assign Courses to Group</DialogTitle>
                                            <CardDescription>Select courses for {group.name} members.</CardDescription>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4 max-h-96 overflow-y-auto">
                                            {allCourses.filter(c => !group.assignedCourses?.some((ac: any) => ac.courseId === c.id)).map(course => (
                                                <div key={course.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-50">
                                                    <Checkbox
                                                        checked={selectedCourseIds.includes(course.id)}
                                                        onCheckedChange={(checked) => {
                                                            setSelectedCourseIds(prev =>
                                                                checked ? [...prev, course.id] : prev.filter(id => id !== course.id)
                                                            )
                                                        }}
                                                    />
                                                    <div className="h-8 w-8 bg-blue-50 rounded flex items-center justify-center">
                                                        <BookOpen className="h-4 w-4 text-blue-500" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium">{course.title}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <DialogFooter>
                                            <Button variant="ghost" onClick={() => setIsCourseAddOpen(false)}>Cancel</Button>
                                            <Button className="bg-slate-900 text-white" onClick={handleAssignCourses}>Assign Selected</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {group.assignedCourses?.map((ac: any) => (
                                    <div key={ac.courseId} className="flex items-center justify-between p-4 border rounded-xl hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-x-3">
                                            <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                                <BookOpen className="h-5 w-5 text-blue-500" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">{ac.course.title}</p>
                                                <p className="text-xs text-slate-500">{ac.course._count?.lessons || 0} Lessons</p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => unenrollGroupFromCourse(group.id, ac.courseId).then(() => fetchData())}>
                                            <XCircle className="h-4 w-4 text-slate-300 hover:text-red-500" />
                                        </Button>
                                    </div>
                                ))}
                                {(!group.assignedCourses || group.assignedCourses.length === 0) && (
                                    <div className="col-span-2 text-center py-12 bg-slate-50 rounded-xl border border-dashed text-slate-400">
                                        No courses assigned to this group yet.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="reports">
                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg font-bold">Progress Analytics</CardTitle>
                                    <CardDescription>Aggregate performance of group members.</CardDescription>
                                </div>
                                <Button variant="outline" className="gap-x-2">
                                    <Download className="h-4 w-4" />
                                    Export CSV Report
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {report ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50/50 font-bold">
                                            <TableHead className="pl-6">Member</TableHead>
                                            <TableHead>Course Enrollment</TableHead>
                                            <TableHead className="text-center">Completion</TableHead>
                                            <TableHead className="text-right pr-6">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {report.reportData.map((data: any) => (
                                            <TableRow key={data.userId}>
                                                <TableCell className="pl-6">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-slate-900">{data.userName}</span>
                                                        <span className="text-[11px] text-slate-400">{data.userEmail}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        {data.courseStats.map((cs: any) => (
                                                            <div key={cs.courseId} className="flex items-center justify-between text-[11px]">
                                                                <span className="truncate max-w-[150px]">{cs.courseTitle}</span>
                                                                <span className="font-bold">{Math.round(cs.percentage)}%</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="w-[200px]">
                                                    <div className="flex items-center gap-x-2">
                                                        <Progress value={data.overallPercentage} className="h-2" />
                                                        <span className="text-xs font-bold text-slate-600">{Math.round(data.overallPercentage)}%</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right pr-6">
                                                    {data.overallPercentage === 100 ? (
                                                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Completed</Badge>
                                                    ) : data.overallPercentage > 0 ? (
                                                        <Badge className="bg-sky-50 text-sky-700 border-sky-200">In Progress</Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-slate-400">Not Started</Badge>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center py-24 text-slate-400">
                                    No data available for reporting.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AdminGroupDetailPage;

