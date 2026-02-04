"use client";

import {
    Search, Layout, Star, Sun,
    History, Bell, PanelLeft,
    Search as SearchIcon
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/hooks/use-sidebar";

export const AdminHeader = () => {
    const { toggle } = useSidebar();

    return (
        <div className="h-16 border-b bg-white flex items-center justify-between px-6 sticky top-0 z-40">
            <div className="flex items-center gap-x-4">
                <PanelLeft
                    className="h-4 w-4 text-slate-400 cursor-pointer hover:text-slate-600 transition-colors"
                    onClick={toggle}
                />
                <Star className="h-4 w-4 text-slate-400 cursor-pointer hover:text-slate-600" />
                <span className="text-sm font-medium text-slate-500 flex items-center gap-x-2">
                    <Layout className="h-4 w-4" />
                    Dashboards
                </span>
            </div>

            <div className="flex items-center gap-x-6">
                <div className="relative w-64 group">
                    <SearchIcon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-600 transition-colors" />
                    <Input
                        placeholder="Search"
                        className="h-9 w-full bg-slate-100 border-none pl-9 focus-visible:ring-1 focus-visible:ring-slate-200 transition-all text-sm"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-mono">
                        /
                    </div>
                </div>

                <div className="flex items-center gap-x-4">
                    <Sun className="h-4 w-4 text-slate-400 hover:text-slate-600 cursor-pointer" />
                    <History className="h-4 w-4 text-slate-400 hover:text-slate-600 cursor-pointer" />
                    <div className="relative">
                        <Bell className="h-4 w-4 text-slate-400 hover:text-slate-600 cursor-pointer" />
                        <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full border border-white" />
                    </div>
                </div>
            </div>
        </div>
    );
};
