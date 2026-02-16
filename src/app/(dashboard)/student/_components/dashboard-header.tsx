"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

interface DashboardHeaderProps {
    user: {
        name: string | null;
        image: string | null;
        email: string | null;
        username?: string | null;
    } | null;
    stats: {
        courses: number;
        completed: number;
        certificates: number;
        points: number;
    };
}

export const DashboardHeader = ({
    user,
    stats
}: DashboardHeaderProps) => {
    return (
        <div className="flex flex-col items-center justify-center py-4 space-y-4">
            <div className="flex flex-col items-center space-y-3">
                <Avatar className="h-24 w-24 border-4 border-white shadow-md">
                    <AvatarImage src={user?.image || ""} />
                    <AvatarFallback className="bg-slate-100 text-2xl font-bold text-slate-500">
                        {user?.name?.[0] || user?.email?.[0] || "U"}
                    </AvatarFallback>
                </Avatar>
                <div className="text-center space-y-0.5">
                    <h1 className="text-2xl font-bold text-slate-900">
                        {user?.name || user?.username || "Your Name"}
                    </h1>
                    <Link
                        href="/student/settings"
                        className="text-xs text-slate-400 hover:text-indigo-600 transition underline-offset-4 hover:underline font-medium"
                    >
                        Edit profile
                    </Link>
                </div>
            </div>

            <div className="flex items-center justify-center w-full max-w-xl divide-x divide-slate-100">
                <div className="px-6 text-center space-y-0.5">
                    <div className="text-3xl font-bold text-slate-900">{stats.courses}</div>
                    <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Courses</div>
                </div>
                <div className="px-6 text-center space-y-0.5">
                    <div className="text-3xl font-bold text-slate-900">{stats.completed}</div>
                    <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Completed</div>
                </div>
                <div className="px-6 text-center space-y-0.5">
                    <div className="text-3xl font-bold text-slate-900">{stats.certificates}</div>
                    <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Certificates</div>
                </div>
                <div className="px-6 text-center space-y-0.5">
                    <div className="text-3xl font-bold text-slate-900">{stats.points}</div>
                    <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Points</div>
                </div>
            </div>
        </div>
    );
};
