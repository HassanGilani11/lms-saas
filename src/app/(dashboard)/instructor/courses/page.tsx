"use client";

import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Pencil, MoreHorizontal } from "lucide-react";
import Link from "next/link";

const courses = [
    {
        id: "1",
        title: "Introduction to Next.js 15",
        price: 49.99,
        isPublished: true,
    },
    {
        id: "2",
        title: "Advanced React Patterns",
        price: 79.99,
        isPublished: false,
    },
    {
        id: "3",
        title: "Prisma & PostgreSQL Masterclass",
        price: 59.99,
        isPublished: true,
    },
];

const InstructorCoursesPage = () => {
    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold">My Courses</h1>
                <Link href="/instructor/courses/create">
                    <Button>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        New Course
                    </Button>
                </Link>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {courses.map((course) => (
                            <TableRow key={course.id}>
                                <TableCell className="font-medium">{course.title}</TableCell>
                                <TableCell>
                                    {course.price ? `$${course.price.toFixed(2)}` : "Free"}
                                </TableCell>
                                <TableCell>
                                    {course.isPublished ? (
                                        <Badge className="bg-emerald-500 hover:bg-emerald-600">
                                            Published
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary">Draft</Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Link href={`/instructor/courses/${course.id}`}>
                                        <Button variant="ghost" size="icon">
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                    <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default InstructorCoursesPage;
