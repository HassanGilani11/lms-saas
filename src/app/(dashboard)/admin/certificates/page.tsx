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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Award, MoreVertical, Trash2, Plus, User, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
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

const CertificatesPage = () => {
    const [certificates, setCertificates] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

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
            setIsDialogOpen(false);
            setSelectedUserId("");
            setSelectedCourseId("");
            fetchData();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const onDelete = async (id: string) => {
        if (confirm("Are you sure? This will revoke the user's certificate.")) {
            await deleteCertificate(id);
            fetchData();
        }
    };

    return (
        <div className="p-6 text-black">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold">Certificate Archive</h1>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Issue Manually
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Issue Manual Certificate</DialogTitle>
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
                                className="w-full"
                                onClick={onIssue}
                                disabled={isSubmitting || !selectedUserId || !selectedCourseId}
                            >
                                {isSubmitting ? "Issuing..." : "Issue Certificate"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Issued Certificates</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Recipient</TableHead>
                                <TableHead>Course</TableHead>
                                <TableHead>Verification Code</TableHead>
                                <TableHead>Issued At</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {certificates.map((cert) => (
                                <TableRow key={cert.id}>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{cert.user.name || "N/A"}</span>
                                            <span className="text-xs text-muted-foreground">{cert.user.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{cert.course.title}</TableCell>
                                    <TableCell>
                                        <code className="bg-slate-100 px-1 py-0.5 rounded text-xs font-mono">
                                            {cert.certificateCode}
                                        </code>
                                    </TableCell>
                                    <TableCell>{format(new Date(cert.issuedAt), "MMM dd, yyyy")}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() => onDelete(cert.id)}
                                                    className="text-destructive focus:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Revoke/Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {certificates.length === 0 && !isLoading && (
                        <div className="text-center py-10 text-muted-foreground flex flex-col items-center gap-2">
                            <Award className="h-8 w-8 text-slate-300" />
                            <p>No certificates have been issued yet.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default CertificatesPage;
