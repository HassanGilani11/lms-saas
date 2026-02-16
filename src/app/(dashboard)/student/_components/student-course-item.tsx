"use client";

import { CheckCircle2, ChevronDown, Circle, PlayCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useState } from "react";
import Link from "next/link";

interface StudentCourseItemProps {
    id: string;
    title: string;
    progress: number;
    isCompleted: boolean;
    lessonsCount: number;
}

export const StudentCourseItem = ({
    id,
    title,
    progress,
    isCompleted,
    lessonsCount,
}: StudentCourseItemProps) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="group border rounded-xl bg-white overflow-hidden transition-all hover:border-slate-300 shadow-sm hover:shadow-md">
            <div className="flex items-center px-5 py-3 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                <div className="flex-shrink-0 mr-4">
                    {isCompleted ? (
                        <div className="h-7 w-7 rounded-full bg-indigo-600 flex items-center justify-center">
                            <CheckCircle2 className="h-4 w-4 text-white" />
                        </div>
                    ) : (
                        <div className="relative h-7 w-7 flex items-center justify-center">
                            <Circle className="h-7 w-7 text-slate-100" strokeWidth={3} />
                            <Circle
                                className="absolute h-7 w-7 text-indigo-600 scale-100"
                                strokeWidth={3}
                                style={{
                                    strokeDasharray: "100",
                                    strokeDashoffset: 100 - progress
                                }}
                            />
                        </div>
                    )}
                </div>

                <div className="flex-grow font-bold text-[14px] text-slate-700 leading-tight">
                    {title}
                </div>

                <div className="flex items-center space-x-3">
                    <PlayCircle className="h-4 w-4 text-indigo-600" />

                    {isCompleted ? (
                        <Badge className="bg-indigo-600 hover:bg-indigo-600 text-white font-bold text-[9px] py-0 px-2.5 h-6">
                            COMPLETE
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="text-slate-400 border-slate-200 font-bold text-[9px] py-0 px-2.5 h-6 uppercase">
                            IN PROGRESS
                        </Badge>
                    )}

                    <div className={cn(
                        "h-7 w-7 rounded-full bg-slate-900 flex items-center justify-center transition-transform",
                        isOpen && "rotate-180"
                    )}>
                        <ChevronDown className="h-4 w-4 text-white" />
                    </div>
                </div>
            </div>

            {isOpen && (
                <div className="px-5 py-3 bg-slate-50/50 border-t flex justify-between items-center text-[12px]">
                    <div className="text-slate-500 font-medium">
                        {lessonsCount} Lessons • {progress}% Complete
                    </div>
                    <Link
                        href={`/courses/${id}`}
                        className="text-indigo-600 font-bold hover:underline"
                    >
                        Go to Course
                    </Link>
                </div>
            )}
        </div>
    );
};
