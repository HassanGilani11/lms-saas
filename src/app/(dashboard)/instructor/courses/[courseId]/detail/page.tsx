"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getCourseById } from "@/actions/course";
import { ChevronRight, Pencil, BookOpen, Users, BarChart, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { CoursePrice } from "@/components/course-price";
import { getSettings } from "@/actions/settings";

const InstructorCourseDetailPage = () => {
    const params = useParams();
    const router = useRouter();
    const courseId = params.courseId as string;
    const [course, setCourse] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [settings, setSettings] = useState<any>(null);

    useEffect(() => {
        const fetchCourseAndSettings = async () => {
            setIsLoading(true);
            const [courseData, settingsData] = await Promise.all([
                getCourseById(courseId),
                getSettings()
            ]);
            setCourse(courseData);
            setSettings(settingsData);
            setIsLoading(false);
        };
        fetchCourseAndSettings();
    }, [courseId]);

    if (isLoading) return <div className="p-6 text-slate-400 font-sans">Loading course details...</div>;
    if (!course) return <div className="p-6 text-slate-400 font-bold font-sans">Course not found.</div>;

    return (
        <div className="p-6 space-y-6 font-sans animate-in fade-in duration-500">
            <div className="flex items-center gap-x-2 text-sm text-slate-500">
                <span>Dashboards</span>
                <ChevronRight className="h-4 w-4" />
                <span>Courses</span>
                <ChevronRight className="h-4 w-4" />
                <span className="text-slate-900 dark:text-slate-100 font-medium tracking-tight">Detail View</span>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-slate-900 dark:bg-slate-100 p-2 rounded-xl text-white dark:text-slate-900 shadow-lg">
                        <LayoutGrid size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 uppercase tracking-tighter">Course Overview</h1>
                        <p className="text-[12px] text-slate-500 dark:text-slate-400 font-medium">Review your course content and performance</p>
                    </div>
                </div>
                <Button
                    onClick={() => router.push(`/instructor/courses/${courseId}/edit`)}
                    className="h-9 text-[13px] font-bold bg-slate-900 hover:bg-slate-800 text-white px-6 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 rounded-xl shadow-sm transition-all hover:scale-[1.02]"
                >
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit Content
                </Button>
            </div>

            <Card className="border-none shadow-sm overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-3xl">
                <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row gap-10">
                        <div className="w-full md:w-[320px] shrink-0">
                            <div className="aspect-video relative rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm transition-transform hover:scale-[1.02] duration-300">
                                {course.imageUrl ? (
                                    <Image
                                        src={course.imageUrl}
                                        alt={course.title}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                        <BookOpen className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                                    </div>
                                )}
                            </div>

                            <div className="mt-8 space-y-4">
                                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Analytics Snapshot</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl space-y-1">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Exp. Level</span>
                                        <div className="flex items-center gap-x-2 text-[13px] font-bold text-slate-700 dark:text-slate-200">
                                            <BarChart className="h-3.5 w-3.5 text-blue-500" />
                                            {course.level || "Beginner"}
                                        </div>
                                    </div>
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl space-y-1">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Current Price</span>
                                        <div className="text-[13px] font-bold text-slate-700 dark:text-slate-200">
                                            <CoursePrice price={course.price || 0} />
                                        </div>
                                    </div>
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl space-y-1">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Max Capacity</span>
                                        <div className="flex items-center gap-x-2 text-[13px] font-bold text-slate-700 dark:text-slate-200">
                                            <Users className="h-3.5 w-3.5 text-orange-500" />
                                            {course.capacity || "Unlimited"}
                                        </div>
                                    </div>
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl space-y-1">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Hub Status</span>
                                        <div className="text-[11px] font-bold uppercase tracking-wider">
                                            {!course.isActive ? (
                                                <span className="text-rose-500">Inactive</span>
                                            ) : course.isPublished ? (
                                                <span className="text-emerald-500">Published</span>
                                            ) : (
                                                <span className="text-amber-500">Draft</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 space-y-6">
                            <div className="space-y-3">
                                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 leading-tight tracking-tighter">
                                    {course.title}
                                </h2>
                                <div className="flex items-center gap-x-3 text-sm">
                                    <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg font-bold text-[10px] uppercase tracking-wider border border-indigo-100 dark:border-indigo-800/50">
                                        {course.category?.name || "Uncategorized"}
                                    </span>
                                    {course.courseCode && (
                                        <span className="text-slate-400 dark:text-slate-500 font-mono text-[12px] font-medium">
                                            [{course.courseCode}]
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="prose prose-slate dark:prose-invert max-w-none">
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[15px] italic font-medium border-l-4 border-slate-200 dark:border-slate-800 pl-4 py-1">
                                    {course.description || "No description provided for this course. Click edit to add an inspiring overview!"}
                                </p>
                            </div>

                            <div className="pt-8 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
                                <div className="flex items-center gap-x-3">
                                    <div className="h-10 w-10 rounded-xl bg-slate-900 dark:bg-slate-100 flex items-center justify-center font-bold text-white dark:text-slate-900 shadow-md">
                                        {course.user?.name?.[0] || "I"}
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Master Instructor</p>
                                        <p className="text-[14px] font-bold text-slate-700 dark:text-slate-200 tracking-tight">{course.user?.name || "Self"}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Curriculum</p>
                                    <p className="text-[14px] font-bold text-slate-700 dark:text-slate-200 tracking-tight">{course._count?.lessons || 0} Modules Crafted</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default InstructorCourseDetailPage;
