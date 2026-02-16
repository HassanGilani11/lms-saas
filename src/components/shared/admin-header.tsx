"use client";

import {
    Layout,
    PanelLeft
} from "lucide-react";
import { useSidebar } from "@/hooks/use-sidebar";
import { NotificationDropdown } from "@/components/notifications/notification-dropdown";
import { ModeToggle } from "@/components/shared/mode-toggle";
import { SearchCommand } from "@/components/shared/search-command";
import { HistoryPopover } from "@/components/shared/history-popover";
import { FavoritesPopover } from "@/components/shared/favorites-popover";

export const AdminHeader = () => {
    const { toggle } = useSidebar();

    return (
        <div className="h-16 border-b bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-40 transition-colors duration-300">
            <div className="flex items-center gap-x-4">
                <PanelLeft
                    className="h-4 w-4 text-slate-400 cursor-pointer hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    onClick={toggle}
                />
                <FavoritesPopover />
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-x-2">
                    <Layout className="h-4 w-4" />
                    Dashboards
                </span>
            </div>

            <div className="flex items-center gap-x-6">
                <SearchCommand />

                <div className="flex items-center gap-x-4">
                    <ModeToggle />
                    <HistoryPopover />
                    <NotificationDropdown />
                </div>
            </div>
        </div>
    );
};
