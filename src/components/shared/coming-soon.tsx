"use client";

import { LucideIcon, Rocket, Hammer, Construction } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface ComingSoonProps {
    title: string;
    icon?: LucideIcon;
    description?: string;
}

export const ComingSoon = ({
    title,
    icon: Icon = Rocket,
    description = "We're currently working hard to bring you this feature. Stay tuned for updates!"
}: ComingSoonProps) => {
    return (
        <div className="h-full flex flex-col items-center justify-center p-8 space-y-6 min-h-[80vh]">
            <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <Card className="relative h-24 w-24 rounded-3xl bg-white flex items-center justify-center border-none shadow-2xl">
                    <Icon className="h-10 w-10 text-indigo-600" />
                </Card>
                <div className="absolute -top-2 -right-2">
                    <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100 flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                        <Hammer className="h-3 w-3" />
                        In Dev
                    </Badge>
                </div>
            </div>

            <div className="text-center max-w-md space-y-2">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    {title}
                </h1>
                <p className="text-slate-500 font-medium leading-relaxed">
                    {description}
                </p>
            </div>

            <div className="flex items-center gap-x-2 pt-4">
                <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center">
                            <div className="h-full w-full rounded-full bg-slate-200 animate-pulse" />
                        </div>
                    ))}
                </div>
                <span className="text-xs font-semibold text-slate-400">
                    Join 1,200+ users waiting for this
                </span>
            </div>

            <div className="pt-8">
                <div className="flex items-center gap-x-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
                    <Construction className="h-4 w-4 text-slate-400" />
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                        Expected Release: Q2 2024
                    </span>
                </div>
            </div>
        </div>
    );
};
