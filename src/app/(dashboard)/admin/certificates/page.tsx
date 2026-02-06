"use client";

import { useEffect, useState } from "react";
import {
    deleteCertificate,
    issueManualCertificate
} from "@/actions/certificate";
import { getUsers } from "@/actions/user";
import { getAdminCourses, getAdminCertificates } from "@/actions/admin";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { format } from "date-fns";
import { Award, MoreVertical, Trash2, Plus, Eye, Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "react-hot-toast";

const CertificatesPage = () => {
    const [certificates, setCertificates] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const [selectedUserId, setSelectedUserId] = useState("");
    const [selectedCourseId, setSelectedCourseId] = useState("");

    const fetchData = async () => {
        setIsLoading(true);
        const [certsData, usersData, coursesData] = await Promise.all([
            getAdminCertificates(),
            getUsers(),
            getAdminCourses()
        ]);

        setCertificates(certsData);
        setUsers(usersData);
        setCourses(coursesData);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onIssue = async () => {
        if (!selectedUserId || !selectedCourseId) return;

        setIsSubmitting(true);
        try {
            await issueManualCertificate(selectedUserId, selectedCourseId);
            toast.success("Certificate issued successfully");
            setIsDialogOpen(false);
            setSelectedUserId("");
            setSelectedCourseId("");
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error("Failed to issue certificate");
        } finally {
            setIsSubmitting(false);
        }
    };

    const onDelete = async (id: string) => {
        if (confirm("Are you sure? This will revoke the user's certificate.")) {
            await deleteCertificate(id);
            toast.success("Certificate revoked");
            fetchData();
        }
    };

    const onView = (code: string) => {
        window.open(`/certificates/${code}`, "_blank");
    };

    const filteredCertificates = certificates.filter(cert =>
        cert.user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.certificateCode.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 font-sans p-6 text-black">
            <h1 className="text-[15px] font-bold text-slate-800">Certificate Archive</h1>

            <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-white px-6 py-4 border-b">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-x-2">
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="font-sans">
                                    <DialogHeader>
                                        <DialogTitle className="text-[16px] font-bold">Issue Manual Certificate</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Select Student</label>
                                            <Select onValueChange={setSelectedUserId} value={selectedUserId}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a student" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {users.map((user) => (
                                                        <SelectItem key={user.id} value={user.id}>
                                                            {user.name || user.email}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Select Course</label>
                                            <Select onValueChange={setSelectedCourseId} value={selectedCourseId}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a course" />
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
                                        <Button
                                            className="w-full h-10 bg-slate-900 text-[13px] font-bold mt-6"
                                            onClick={onIssue}
                                            disabled={isSubmitting || !selectedUserId || !selectedCourseId}
                                        >
                                            {isSubmitting ? "Issuing..." : "Issue Certificate"}
                                        </Button>
                                    </div>
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
                                placeholder="Search Certificates"
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
                                <TableHead className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter pl-6">Recipient</TableHead>
                                <TableHead className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">Course</TableHead>
                                <TableHead className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">Verification Code</TableHead>
                                <TableHead className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">Issued At</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCertificates.map((cert) => (
                                <TableRow key={cert.id} className="group hover:bg-slate-50/50 border-b last:border-0">
                                    <TableCell className="pl-6">
                                        <div className="flex flex-col">
                                            <span className="text-[12px] font-medium text-slate-700">{cert.user.name || "N/A"}</span>
                                            <span className="text-[10px] text-slate-400">{cert.user.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-[12px] text-slate-500">{cert.course.title}</TableCell>
                                    <TableCell>
                                        <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px] font-mono text-slate-600">
                                            {cert.certificateCode}
                                        </code>
                                    </TableCell>
                                    <TableCell className="text-[12px] text-slate-500">{format(new Date(cert.issuedAt), "MMM dd, yyyy")}</TableCell>
                                    <TableCell className="text-right pr-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="text-[13px]">
                                                <DropdownMenuItem onClick={() => onView(cert.certificateCode)}>
                                                    <Eye className="h-3.5 w-3.5 mr-2" />
                                                    View / PDF
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => onDelete(cert.id)}
                                                    className="text-destructive focus:text-destructive"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                                                    Revoke
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredCertificates.length === 0 && !isLoading && (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <Award className="h-8 w-8 text-slate-300" />
                                            <p className="text-[13px]">No certificates found.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <div className="flex items-center justify-center gap-x-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 border bg-white shadow-sm"><ChevronLeft className="h-4 w-4" /></Button>
                <Button variant="default" className="h-8 w-10 text-[12px] font-bold border bg-slate-100 text-slate-900 shadow-sm">1</Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 border bg-white shadow-sm"><ChevronRight className="h-4 w-4" /></Button>
            </div>
        </div>
    );
};

export default CertificatesPage;
