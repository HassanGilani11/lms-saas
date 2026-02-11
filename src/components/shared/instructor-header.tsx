"use client";

import { NotificationDropdown } from "@/components/notifications/notification-dropdown";
import { useSettings } from "@/components/providers/settings-provider";

export const InstructorHeader = () => {
    const { settings } = useSettings();

    return (
        <div className="h-16 border-b bg-white flex items-center justify-between px-6 sticky top-0 z-40 bg-white/80 backdrop-blur-md">
            <div className="flex items-center gap-x-4">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight md:hidden">
                    {settings?.siteName || "LMS"}
                </h2>
            </div>

            <div className="flex items-center gap-x-6">
                <NotificationDropdown />
            </div>
        </div>
    );
};
