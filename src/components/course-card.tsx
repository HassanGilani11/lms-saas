"use client";

import Image from "next/image";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { format as formatDate } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useFormatPrice } from "@/hooks/use-format-price";

interface CourseCardProps {
    id: string;
    title: string;
    description: string | null;
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
    description,
    imageUrl,
    lessonsCount,
    progress,
    category,
    price,
    isEnrolled,
    lastActivity,
}: CourseCardProps) => {
    const { format } = useFormatPrice();

    return (
        <Link href={`/courses/${id}`} className="block h-full group">
            <div className="h-full hover:shadow-xl transition-all duration-300 overflow-hidden border rounded-[2rem] p-0 flex flex-col bg-white hover:-translate-y-1 relative">
                <div className="relative w-full aspect-video overflow-hidden bg-slate-100">
                    {imageUrl ? (
                        <Image
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                            alt={title}
                            src={imageUrl}
                        />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-violet-100 group-hover:scale-105 transition-transform duration-500">
                            <BookOpen className="h-12 w-12 text-indigo-400 group-hover:text-indigo-600 transition-colors" />
                        </div>
                    )}
                </div>

                <div className="flex flex-col flex-1 px-5 pb-5 pt-3">
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold text-slate-400 capitalize bg-slate-50 px-2 py-0.5 rounded-md tracking-wider">
                            {category}
                        </span>
                        <span className="text-[13px] font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                            {format(price || 0)}
                        </span>
                    </div>

                    <h3 className="text-[17px] font-extrabold text-slate-800 line-clamp-1 mb-0.5 group-hover:text-indigo-600 transition-colors leading-tight">
                        {title}
                    </h3>

                    {description && (
                        <p className="text-[12px] text-slate-500 line-clamp-2 mb-3 font-medium leading-tight">
                            {description}
                        </p>
                    )}

                    <div className="mt-auto space-y-3">
                        <div className="flex items-center justify-between px-0.5">
                            <div className="flex items-center gap-x-1">
                                <BookOpen className="h-3 w-3 text-indigo-600" />
                                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">
                                    {lessonsCount} Modules
                                </span>
                            </div>
                            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-tight">
                                {Math.round(progress || 0)}% Complete
                            </span>
                        </div>

                        <div className="relative h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 transition-all duration-1000 ease-in-out"
                                style={{ width: `${progress || 0}%` }}
                            />
                        </div>

                        {lastActivity && (
                            <p className="text-[9px] text-slate-400 font-medium px-0.5">
                                Last activity on {formatDate(lastActivity, "MMM d, yyyy")}
                            </p>
                        )}

                        <Button
                            className="w-full rounded-xl py-4 text-xs font-bold bg-slate-900 hover:bg-slate-800 shadow-sm transition-all group-hover:bg-indigo-600 group-hover:text-white h-9"
                        >
                            {isEnrolled ? "Open Course" : "Enroll"}
                        </Button>
                    </div>
                </div>
            </div>
        </Link>
    );
};
