"use client";

import { AdminSidebar } from "@/components/shared/admin-sidebar";
import { AdminHeader } from "@/components/shared/admin-header";
import { AdminRightSidebar } from "@/components/shared/admin-right-sidebar";
import { SidebarProvider, useSidebar } from "@/hooks/use-sidebar";
import { cn } from "@/lib/utils";

const AdminLayoutContent = ({ children }: { children: React.ReactNode }) => {
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
                <AdminHeader />
                <div className="flex h-full overflow-hidden">
                    {/* Main Scrollable Content */}
                    <main className="flex-1 overflow-y-auto px-8 py-6">
                        {children}
                    </main>

                    {/* Right Supplementary Panel */}
                    <div className="hidden lg:block w-[300px] h-full shrink-0 sticky top-16">
                        <AdminRightSidebar />
                    </div>
                </div>
            </div>
        </div>
    );
};

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <SidebarProvider>
            <AdminLayoutContent>
                {children}
            </AdminLayoutContent>
        </SidebarProvider>
    );
};

export default AdminLayout;
