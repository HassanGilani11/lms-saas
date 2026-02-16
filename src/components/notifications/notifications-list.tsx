"use client";

import { useNotifications } from "@/components/providers/notification-provider";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Bell, BookOpen, Check, CheckCircle2, GraduationCap, Info, Rss, UserPlus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Mapping types to icons and colors to match the premium design
const getNotificationConfig = (type: string) => {
    switch (type) {
        case "ENROLLMENT":
            return {
                icon: BookOpen,
                color: "text-emerald-600",
                bg: "bg-emerald-50",
                border: "border-emerald-100"
            };
        case "COURSE_UPDATE":
            return {
                icon: Rss,
                color: "text-amber-600",
                bg: "bg-amber-50",
                border: "border-amber-100"
            };
        case "QUIZ_GRADED":
            return {
                icon: GraduationCap,
                color: "text-indigo-600",
                bg: "bg-indigo-50",
                border: "border-indigo-100"
            };
        case "SYSTEM":
            return {
                icon: UserPlus,
                color: "text-blue-600",
                bg: "bg-blue-50",
                border: "border-blue-100"
            };
        default:
            return {
                icon: Info,
                color: "text-slate-500",
                bg: "bg-slate-50",
                border: "border-slate-100"
            };
    }
};

export const NotificationsList = () => {
    const { notifications, unreadCount, markAsRead } = useNotifications();

    const handleMarkAllRead = async () => {
        const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
        if (unreadIds.length > 0) {
            await markAsRead(unreadIds);
        }
    };

    if (notifications.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="bg-slate-50 p-6 rounded-full mb-4">
                    <Bell className="h-10 w-10 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No notifications yet</h3>
                <p className="text-slate-500 max-w-sm mt-2">
                    We'll notify you when something important happens, like course updates or new enrollments.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold text-slate-900">All Notifications</h2>
                    <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 font-bold">
                        {notifications.length}
                    </Badge>
                </div>
                {unreadCount > 0 && (
                    <Button variant="outline" size="sm" onClick={handleMarkAllRead} className="text-xs">
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Mark all as read
                    </Button>
                )}
            </div>

            <div className="space-y-3">
                {notifications.map((notification) => {
                    const config = getNotificationConfig(notification.type);
                    const Icon = config.icon;

                    return (
                        <div
                            key={notification.id}
                            className={cn(
                                "relative flex gap-4 p-5 rounded-2xl border transition-all duration-200 group",
                                notification.isRead
                                    ? "bg-white border-slate-100 hover:border-slate-200"
                                    : "bg-blue-50/30 border-blue-100 hover:border-blue-200 shadow-sm"
                            )}
                        >
                            <div className={cn(
                                "h-12 w-12 rounded-xl flex items-center justify-center shrink-0 border shadow-sm",
                                config.bg,
                                config.border
                            )}>
                                <Icon className={cn("h-6 w-6", config.color)} />
                            </div>

                            <div className="flex-1 min-w-0 pt-0.5">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={cn(
                                                "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white border",
                                                config.color,
                                                config.border
                                            )}>
                                                {notification.type.replace("_", " ")}
                                            </span>
                                            <span className="text-xs text-slate-400">
                                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <h4 className={cn(
                                            "text-base font-bold",
                                            notification.isRead ? "text-slate-700" : "text-slate-900"
                                        )}>
                                            {notification.title}
                                        </h4>
                                        <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">
                                            {notification.message}
                                        </p>
                                    </div>
                                    {!notification.isRead && (
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full"
                                            onClick={() => markAsRead([notification.id])}
                                            title="Mark as read"
                                        >
                                            <div className="h-2 w-2 rounded-full bg-blue-500" />
                                        </Button>
                                    )}
                                </div>

                                {notification.href && (
                                    <div className="mt-4">
                                        <Button asChild variant="outline" size="sm" className="h-8 text-xs font-bold border-slate-200 rounded-lg hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                                            <Link href={notification.href}>
                                                View Details
                                            </Link>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
