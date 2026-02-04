"use client";

import { useSidebar } from "@/hooks/use-sidebar";
import { cn } from "@/lib/utils";
import { AdminSidebar } from "@/components/shared/admin-sidebar";

export const AdminLayoutWrapper = ({ children }: { children: React.ReactNode }) => {
    const { isCollapsed } = useSidebar();

    return (
        <div className="h-full bg-slate-50/30">
            {/* Main Sidebar */}
            <div
                className={cn(
                    "hidden md:flex h-full flex-col fixed inset-y-0 z-50 transition-all duration-300 ease-in-out overflow-hidden",
                    isCollapsed ? "w-0 -translate-x-full" : "w-64 translate-x-0"
                )}
            >
                <div className="h-full w-64">
                    <AdminSidebar />
                </div>
            </div>

            {/* Content Hub */}
            <div
                className={cn(
                    "h-full flex flex-col transition-all duration-300 ease-in-out",
                    isCollapsed ? "md:pl-0" : "md:pl-64"
                )}
            >
                {children}
            </div>
        </div>
    );
};
