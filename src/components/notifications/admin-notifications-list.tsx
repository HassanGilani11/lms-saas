"use client";

import React from "react";

import {
    Bug,
    UserPlus,
    Rss,
    BookOpen,
    GraduationCap,
    Settings,
    Bell,
    CheckCircle2,
    Info
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNotifications } from "@/components/providers/notification-provider";
import { cn } from "@/lib/utils";

// Mapping types to icons and colors to match the premium design
const getNotificationConfig = (type: string) => {
    switch (type) {
        case "ENROLLMENT":
            return {
                icon: BookOpen,
                color: "text-emerald-500",
                bg: "bg-emerald-50"
            };
        case "COURSE_UPDATE":
            return {
                icon: Rss, // or BookOpen
                color: "text-amber-500",
                bg: "bg-amber-50"
            };
        case "QUIZ_GRADED":
            return {
                icon: GraduationCap,
                color: "text-indigo-500",
                bg: "bg-indigo-50"
            };
        case "SYSTEM":
            return {
                icon: UserPlus,
                color: "text-blue-500",
                bg: "bg-blue-50"
            };
        default:
            return {
                icon: Info,
                color: "text-slate-500",
                bg: "bg-slate-50"
            };
    }
};

export const AdminNotificationsList = () => {
    const { notifications } = useNotifications();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    if (notifications.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-10 text-center">
                <Bell className="h-8 w-8 text-slate-200 mb-2" />
                <p className="text-[11px] text-slate-400 font-medium">No recent notifications</p>
            </div>
        );
    }

    // Only show latest 5 to keep it clean in the sidebar
    const displayNotifications = notifications.slice(0, 5);

    return (
        <div className="space-y-4">
            {displayNotifications.map((notif) => {
                const config = getNotificationConfig(notif.type);
                const Icon = config.icon;

                return (
                    <div
                        key={notif.id}
                        className={cn(
                            "flex gap-x-3 group cursor-pointer p-0.5 rounded-lg transition-all",
                            !notif.isRead && "hover:bg-slate-50"
                        )}
                    >
                        <div className={cn(
                            "h-8 w-8 rounded-full flex items-center justify-center shrink-0 border border-white shadow-sm",
                            config.bg
                        )}>
                            <Icon className={cn("h-4 w-4", config.color)} />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className={cn(
                                "text-[11px] font-medium truncate transition-colors",
                                notif.isRead ? "text-slate-500" : "text-slate-700 font-bold group-hover:text-blue-600"
                            )}>
                                {notif.title}
                            </span>
                            <span className="text-[10px] text-slate-400">
                                {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                            </span>
                        </div>
                        {!notif.isRead && (
                            <div className="ml-auto mt-1 h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default AdminNotificationsList;
