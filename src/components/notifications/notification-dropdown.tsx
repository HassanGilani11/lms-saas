"use client";

import { Bell, Check, ExternalLink, Mail, Trash } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/components/providers/notification-provider";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export const NotificationDropdown = () => {
    const { notifications, unreadCount, markAsRead } = useNotifications();
    const { data: session } = useSession();

    const role = session?.user?.role;
    const dashboardPath = role === "ADMIN" ? "admin" : (role === "INSTRUCTOR" ? "instructor" : "student");

    const handleMarkAllRead = async () => {
        const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
        if (unreadIds.length > 0) {
            await markAsRead(unreadIds);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative group">
                    <Bell className="h-5 w-5 text-slate-500 group-hover:text-slate-900 transition-colors" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-in zoom-in duration-300">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[380px] p-0 font-sans shadow-xl border-slate-100 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
                <div className="flex items-center justify-between p-4 border-b dark:border-slate-800">
                    <h3 className="font-bold text-slate-900 dark:text-slate-100">Notifications</h3>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 h-auto p-0"
                            onClick={handleMarkAllRead}
                        >
                            Mark all as read
                        </Button>
                    )}
                </div>

                <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 dark:text-slate-500">
                            <Bell className="h-10 w-10 mb-2 opacity-20" />
                            <p className="text-sm">No notifications yet</p>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <DropdownMenuItem
                                key={notification.id}
                                className={cn(
                                    "flex flex-col items-start p-4 cursor-pointer border-b border-slate-50 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors focus:bg-slate-50 dark:focus:bg-slate-900",
                                    !notification.isRead && "bg-blue-50/30 dark:bg-blue-900/10"
                                )}
                                onSelect={() => !notification.isRead && markAsRead([notification.id])}
                            >
                                <div className="flex items-center justify-between w-full mb-1">
                                    <span className={cn(
                                        "text-xs font-bold uppercase tracking-wider",
                                        notification.type === "ENROLLMENT" ? "text-emerald-600 dark:text-emerald-400" :
                                            notification.type === "COURSE_UPDATE" ? "text-amber-600 dark:text-amber-400" :
                                                notification.type === "QUIZ_GRADED" ? "text-indigo-600 dark:text-indigo-400" :
                                                    "text-slate-500 dark:text-slate-400"
                                    )}>
                                        {notification.type.replace("_", " ")}
                                    </span>
                                    <span className="text-[10px] text-slate-400 dark:text-slate-500">
                                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                    </span>
                                </div>
                                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-0.5">{notification.title}</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{notification.message}</p>
                                {notification.href && (
                                    <Link
                                        href={notification.href}
                                        className="mt-2 text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1 dark:text-blue-400"
                                    >
                                        View Details
                                        <ExternalLink className="h-3 w-3" />
                                    </Link>
                                )}
                            </DropdownMenuItem>
                        ))
                    )}
                </div>

                <DropdownMenuSeparator className="m-0 dark:bg-slate-800" />
                <div className="p-2">
                    <Button variant="ghost" size="sm" asChild className="w-full text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900">
                        <Link href={`/${dashboardPath}/notifications`}>View All Notifications</Link>
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
