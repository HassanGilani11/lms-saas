"use client";

import Image from "next/image";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";

interface CourseCardProps {
    id: string;
    title: string;
    imageUrl: string | null;
    lessonsCount: number;
    progress: number | null;
    category: string;
    price: number | null;
    isEnrolled: boolean;
    lastActivity?: Date | null;
}

export const CourseCard = ({
    id,
    title,
    imageUrl,
    lessonsCount,
    progress,
    category,
    price,
    isEnrolled,
    lastActivity,
}: CourseCardProps) => {
    return (
        <div className="group hover:shadow-xl transition overflow-hidden border rounded-[2rem] p-4 flex flex-col bg-white">
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden mb-4 bg-slate-100">
                {imageUrl ? (
                    <Image
                        fill
                        className="object-cover"
                        alt={title}
                        src={imageUrl}
                    />
                ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-violet-100 group-hover:scale-105 transition-transform duration-500">
                        <BookOpen className="h-12 w-12 text-indigo-400 group-hover:text-indigo-600 transition-colors" />
                    </div>
                )}
            </div>

            <div className="flex flex-col flex-1 px-2">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-400 capitalize bg-slate-50 px-2 py-0.5 rounded-md">
                        {category}
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                        {price !== null ? formatPrice(price) : "Free"}
                    </span>
                </div>

                <h3 className="text-xl font-extrabold text-slate-800 line-clamp-2 min-h-[3.5rem] mb-4 group-hover:text-indigo-600 transition-colors leading-tight">
                    {title}
                </h3>

                <div className="mt-auto space-y-4">
                    <div className="space-y-2">
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 transition-all duration-500 ease-in-out"
                                style={{ width: `${progress || 0}%` }}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                                {Math.round(progress || 0)}% COMPLETE
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                {progress !== null ? Math.round((progress / 100) * lessonsCount) : 0}/{lessonsCount} Steps
                            </span>
                        </div>
                    </div>

                    {lastActivity && (
                        <p className="text-[10px] text-slate-400 font-medium">
                            Last activity on {format(lastActivity, "MMMM d, yyyy h:mm a")}
                        </p>
                    )}

                    <Link href={`/courses/${id}`}>
                        <Button
                            className="w-full rounded-2xl py-6 text-base font-bold bg-slate-900 hover:bg-slate-800 shadow-xl shadow-slate-200"
                        >
                            {isEnrolled ? "Continue Learning" : "Enroll Now"}
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};
