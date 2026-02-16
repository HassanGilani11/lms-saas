"use client";

import { Search, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StudentCourseItem } from "./student-course-item";
import { useState } from "react";

interface StudentCourse {
    id: string;
    title: string;
    progress: number;
    isCompleted: boolean;
    lessonsCount: number;
}

interface StudentCourseListProps {
    courses: StudentCourse[];
}

export const StudentCourseList = ({
    courses
}: StudentCourseListProps) => {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredCourses = courses.filter((course) =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-y-3">
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">Your Courses</h2>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative w-full sm:w-[240px]">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search courses..."
                            className="pl-9 h-9 w-full border-none shadow-sm bg-white text-xs"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button
                        variant="default"
                        size="sm"
                        className="bg-indigo-600 hover:bg-indigo-700 font-bold h-9 rounded-full px-5 flex items-center gap-x-2 w-full sm:w-auto text-[11px]"
                    >
                        <ChevronDown className="h-3.5 w-3.5" />
                        Expand All
                    </Button>
                </div>
            </div>

            <div className="space-y-4">
                {filteredCourses.length > 0 ? (
                    filteredCourses.map((course) => (
                        <StudentCourseItem
                            key={course.id}
                            id={course.id}
                            title={course.title}
                            progress={course.progress}
                            isCompleted={course.isCompleted}
                            lessonsCount={course.lessonsCount}
                        />
                    ))
                ) : (
                    <div className="text-center py-10 text-slate-500">
                        No courses found matching your search.
                    </div>
                )}
            </div>
        </div>
    );
};
