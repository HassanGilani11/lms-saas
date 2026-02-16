"use client";

import { useNotifications } from "@/components/providers/notification-provider";
import { formatDistanceToNow } from "date-fns";
import {
    Bell,
    CheckCircle2,
    ChevronRight,
    Inbox,
    Settings,
    History,
    BookOpen,
    MessageSquare,
    Shield,
    Info,
    Mail,
    Loader2
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { getNotificationPreferences, updateNotificationPreference } from "@/actions/notifications";
import { NotificationType } from "@/lib/prisma";
import { toast } from "react-hot-toast";

const NOTIFICATION_TYPES = [
    {
        type: "ENROLLMENT" as NotificationType,
        label: "Course Enrollments",
        description: "Get notified when you enroll in a new course or when a student joins your course.",
        icon: BookOpen
    },
    {
        type: "COURSE_UPDATE" as NotificationType,
        label: "Course Updates",
        description: "Receive alerts when course content, lessons, or topics are updated.",
        icon: BookOpen
    },
    {
        type: "DISCUSSION" as NotificationType,
        label: "New Discussions",
        description: "Be notified when someone starts a discussion or replies to your comments.",
        icon: MessageSquare
    },
    {
        type: "QUIZ_GRADED" as NotificationType,
        label: "Quiz Results",
        description: "Get alerts when your quiz has been graded or a student completes an assessment.",
        icon: Shield
    },
    {
        type: "SYSTEM" as NotificationType,
        label: "System Announcements",
        description: "Important updates regarding platform maintenance and new features.",
        icon: Info
    },
];

const AdminNotificationsPage = () => {
    const { notifications, markAsRead } = useNotifications();
    const [prefs, setPrefs] = useState<any[]>([]);
    const [isLoadingPrefs, setIsLoadingPrefs] = useState(true);
    const [isSavingPref, setIsSavingPref] = useState(false);

    useEffect(() => {
        const fetchPrefs = async () => {
            const data = await getNotificationPreferences();
            setPrefs(data);
            setIsLoadingPrefs(false);
        };
        fetchPrefs();
    }, []);

    const handleMarkAllRead = () => {
        const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
        if (unreadIds.length > 0) markAsRead(unreadIds);
    };

    const handleTogglePref = async (type: NotificationType, field: "enabled" | "emailEnabled", value: boolean) => {
        setIsSavingPref(true);
        try {
            const currentPref = prefs.find(p => p.type === type);
            const enabled = field === "enabled" ? value : (currentPref?.enabled ?? true);
            const emailEnabled = field === "emailEnabled" ? value : (currentPref?.emailEnabled ?? false);

            const res = await updateNotificationPreference(type, enabled, emailEnabled);
            if (res.success) {
                setPrefs(prev => {
                    const existing = prev.find(p => p.type === type);
                    if (existing) {
                        return prev.map(p => p.type === type ? { ...p, [field]: value } : p);
                    }
                    return [...prev, { type, enabled: true, emailEnabled: false, [field]: value }];
                });
                toast.success("Preferences updated");
            }
        } finally {
            setIsSavingPref(false);
        }
    };

    return (
        <div className="p-6 space-y-8 font-sans text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Notification Center</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage all your system alerts and notification settings.</p>
                </div>
            </div>

            <Tabs defaultValue="history" className="space-y-6">
                <TabsList className="bg-slate-100/50 dark:bg-slate-900/50 p-1 rounded-xl h-12">
                    <TabsTrigger value="history" className="rounded-lg px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100 data-[state=active]:shadow-sm gap-2">
                        <History className="h-4 w-4" />
                        Alert History
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="rounded-lg px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100 data-[state=active]:shadow-sm gap-2">
                        <Settings className="h-4 w-4" />
                        Preferences
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="history" className="space-y-6">
                    <Card className="border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
                            <div>
                                <CardTitle className="text-lg text-slate-900 dark:text-slate-100">Recent Alerts</CardTitle>
                                <CardDescription className="text-slate-500 dark:text-slate-400">Your latest in-app notifications and updates.</CardDescription>
                            </div>
                            {notifications.some(n => !n.isRead) && (
                                <Button variant="outline" size="sm" onClick={handleMarkAllRead} className="border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Mark all as read
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent className="p-0">
                            {notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-20 text-center text-slate-400">
                                    <Inbox className="h-10 w-10 opacity-20 mb-2" />
                                    <h3 className="text-lg font-semibold text-slate-900">No notifications</h3>
                                    <p className="text-sm">When you receive alerts, they will appear here.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-50 dark:divide-slate-800">
                                    {notifications.map((n) => (
                                        <div
                                            key={n.id}
                                            className={cn(
                                                "p-6 flex items-start gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group relative",
                                                !n.isRead && "bg-blue-50/20 dark:bg-blue-900/10"
                                            )}
                                        >
                                            {!n.isRead && (
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                                            )}
                                            <div className={cn(
                                                "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                                                n.isRead ? "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400" : "bg-blue-600 text-white shadow-blue-100 dark:shadow-none"
                                            )}>
                                                <Bell className="h-5 w-5" />
                                            </div>
                                            <div className="flex-grow space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <span className={cn(
                                                        "text-[10px] font-bold uppercase tracking-widest",
                                                        !n.isRead ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"
                                                    )}>
                                                        {n.type.replace("_", " ")}
                                                    </span>
                                                    <span className="text-xs text-slate-400 dark:text-slate-500">
                                                        {formatDistanceToNow(n.createdAt, { addSuffix: true })}
                                                    </span>
                                                </div>
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{n.title}</h3>
                                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">{n.message}</p>

                                                <div className="flex items-center gap-4 pt-2">
                                                    {n.href && (
                                                        <Button variant="link" className="p-0 h-auto text-blue-600 font-bold text-xs" asChild>
                                                            <Link href={n.href}>
                                                                View Details
                                                                <ChevronRight className="h-3 w-3 ml-1" />
                                                            </Link>
                                                        </Button>
                                                    )}
                                                    {!n.isRead && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-auto p-0 text-[11px] font-bold text-slate-400 hover:text-slate-900"
                                                            onClick={() => markAsRead([n.id])}
                                                        >
                                                            Mark as read
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="settings" className="space-y-6">
                    <Card className="border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900">
                        <CardHeader className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
                            <CardTitle className="text-lg text-slate-900 dark:text-slate-100">Notification Toggles</CardTitle>
                            <CardDescription className="text-slate-500 dark:text-slate-400">Select which events you want to be notified about.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            {isLoadingPrefs ? (
                                <div className="p-8 flex items-center justify-center">
                                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-50">
                                    {NOTIFICATION_TYPES.map((item) => {
                                        const pref = prefs.find(p => p.type === item.type);
                                        const isEnabled = pref ? pref.enabled : true;

                                        return (
                                            <div key={item.type} className="flex items-center justify-between p-6 hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-colors border-b dark:border-slate-800 last:border-0">
                                                <div className="flex items-start gap-4">
                                                    <div className="h-10 w-10 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl flex items-center justify-center shrink-0">
                                                        <item.icon className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <h4 className="font-bold text-slate-900 dark:text-slate-100">{item.label}</h4>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">{item.description}</p>
                                                    </div>
                                                </div>
                                                <Switch
                                                    checked={isEnabled}
                                                    onCheckedChange={(checked) => handleTogglePref(item.type, "enabled", checked)}
                                                    disabled={isSavingPref}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-slate-100 dark:border-slate-800 shadow-sm opacity-50 bg-slate-50/50 dark:bg-slate-900/50">
                        <CardHeader className="border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <CardTitle className="text-lg text-slate-900 dark:text-slate-100">Email Summaries</CardTitle>
                                <span className="text-[9px] font-bold bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">BETA</span>
                            </div>
                            <CardDescription className="text-slate-500 dark:text-slate-400">Get weekly course progress and interaction summaries.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0 pointer-events-none grayscale">
                            {NOTIFICATION_TYPES.slice(0, 3).map((item) => (
                                <div key={item.type} className="flex items-center justify-between p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="h-10 w-10 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl flex items-center justify-center">
                                            <Mail className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <h4 className="font-bold text-slate-900 dark:text-slate-100">{item.label}</h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Email notifications</p>
                                        </div>
                                    </div>
                                    <Switch checked={false} disabled />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AdminNotificationsPage;
