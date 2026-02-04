"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getCourseById } from "@/actions/course";
import { ChevronRight, Pencil, ArrowLeft, BookOpen, Clock, Users, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

const CourseDetailPage = () => {
    const params = useParams();
    const router = useRouter();
    const courseId = params.courseId as string;
    const [course, setCourse] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCourse = async () => {
            setIsLoading(true);
            const data = await getCourseById(courseId);
            setCourse(data);
            setIsLoading(false);
        };
        fetchCourse();
    }, [courseId]);

    if (isLoading) return <div className="p-6 text-slate-400">Loading course details...</div>;
    if (!course) return <div className="p-6 text-slate-400 font-bold">Course not found.</div>;

    return (
        <div className="p-6 space-y-6 font-sans">
            <div className="flex items-center gap-x-2 text-sm text-slate-500">
                <span>Dashboards</span>
                <ChevronRight className="h-4 w-4" />
                <span>Courses</span>
                <ChevronRight className="h-4 w-4" />
                <span className="text-slate-900 font-medium">Course Detail</span>
            </div>

            <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-slate-800">Course</h1>
                <Button
                    onClick={() => router.push(`/admin/courses/${courseId}/edit`)}
                    className="h-9 text-[13px] font-bold bg-slate-900 hover:bg-slate-800 text-white px-6"
                >
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit Course
                </Button>
            </div>

            <Card className="border-none shadow-sm overflow-hidden bg-white">
                <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row gap-10">
                        <div className="w-full md:w-[320px] shrink-0">
                            <div className="aspect-video relative rounded-2xl overflow-hidden border border-slate-100 shadow-sm transition-transform hover:scale-[1.02] duration-300">
                                {course.imageUrl ? (
                                    <Image
                                        src={course.imageUrl}
                                        alt={course.title}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                        <BookOpen className="h-10 w-10 text-slate-300" />
                                    </div>
                                )}
                            </div>

                            <div className="mt-8 space-y-4">
                                <h3 className="text-[13px] font-bold text-slate-400 uppercase tracking-widest">Metadata</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-50 rounded-xl space-y-1">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Level</span>
                                        <div className="flex items-center gap-x-2 text-[13px] font-bold text-slate-700">
                                            <BarChart className="h-3.5 w-3.5 text-blue-500" />
                                            {course.level || "Beginner"}
                                        </div>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-xl space-y-1">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Price</span>
                                        <div className="text-[13px] font-bold text-slate-700">
                                            ${course.price?.toFixed(2) || "0.00"}
                                        </div>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-xl space-y-1">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Capacity</span>
                                        <div className="flex items-center gap-x-2 text-[13px] font-bold text-slate-700">
                                            <Users className="h-3.5 w-3.5 text-orange-500" />
                                            {course.capacity || "Unlimited"}
                                        </div>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-xl space-y-1">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Status</span>
                                        <div className="text-[13px] font-bold">
                                            {!course.isActive ? (
                                                <span className="text-rose-600">Inactive</span>
                                            ) : course.isPublished ? (
                                                <span className="text-emerald-600">Active</span>
                                            ) : (
                                                <span className="text-amber-600">Draft</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 space-y-6">
                            <div className="space-y-2">
                                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">
                                    {course.title}
                                </h2>
                                <div className="flex items-center gap-x-3 text-sm">
                                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full font-bold text-[11px] uppercase">
                                        {course.category?.name || "Uncategorized"}
                                    </span>
                                    {course.courseCode && (
                                        <span className="text-slate-400 font-mono text-[12px]">
                                            {course.courseCode}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="prose prose-slate max-w-none">
                                <p className="text-slate-600 leading-relaxed text-[15px]">
                                    {course.description || "No description provided for this course."}
                                </p>
                            </div>

                            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-x-3">
                                    <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-500 overflow-hidden">
                                        {course.user?.name?.[0] || "I"}
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold text-slate-400 uppercase">Instructor</p>
                                        <p className="text-[14px] font-bold text-slate-700">{course.user?.name || "Admin"}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[11px] font-bold text-slate-400 uppercase">Total Modules</p>
                                    <p className="text-[14px] font-bold text-slate-700">{course._count?.modules || 0} Modules</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default CourseDetailPage;
