"use client";

import {
    Bug, UserPlus, UserMinus, Plus,
    Rss, Clock, CheckCircle2
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const notifications = [
    {
        id: 1,
        icon: Bug,
        text: "You have a bug that needs t...",
        time: "Just now",
        color: "text-blue-500",
        bg: "bg-blue-50"
    },
    {
        id: 2,
        icon: UserPlus,
        text: "New user registered",
        time: "59 minutes ago",
        color: "text-slate-600",
        bg: "bg-slate-50"
    },
    {
        id: 3,
        icon: Bug,
        text: "You have a bug that needs t...",
        time: "12 hours ago",
        color: "text-blue-500",
        bg: "bg-blue-50"
    },
    {
        id: 4,
        icon: Rss,
        text: "Andi Lane subscribed to you",
        time: "Today, 11:59 AM",
        color: "text-slate-600",
        bg: "bg-slate-50"
    }
];

const activities = [
    {
        id: 1,
        user: "Kate Morison",
        action: "Edited the details of Project X",
        time: "Just now",
        avatar: ""
    },
    {
        id: 2,
        user: "Drew Cano",
        action: "Released a new version",
        time: "59 minutes ago",
        avatar: ""
    },
    {
        id: 3,
        user: "Orlando Diggs",
        action: "Submitted a bug",
        time: "12 hours ago",
        avatar: ""
    }
];

const contacts = [
    { name: "Natali Craig", avatar: "" },
    { name: "Drew Cano", avatar: "" },
    { name: "Orlando Diggs", avatar: "" },
    { name: "Andi Lane", avatar: "" },
    { name: "Kate Morison", avatar: "" },
    { name: "Koray Okumus", avatar: "" }
];

export const AdminRightSidebar = () => {
    return (
        <div className="w-[300px] h-full border-l bg-white flex flex-col overflow-y-auto p-6 space-y-8 font-sans">
            {/* Notifications */}
            <div className="space-y-4">
                <h3 className="text-[13px] font-bold text-slate-800">Notifications</h3>
                <div className="space-y-4">
                    {notifications.map((notif) => (
                        <div key={notif.id} className="flex gap-x-3 group cursor-pointer">
                            <div className={`h-8 w-8 rounded-full ${notif.bg} flex items-center justify-center shrink-0`}>
                                <notif.icon className={`h-4 w-4 ${notif.color}`} />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-[11px] font-medium text-slate-700 truncate group-hover:text-blue-600 transition-colors">
                                    {notif.text}
                                </span>
                                <span className="text-[10px] text-slate-400">{notif.time}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Activities */}
            <div className="space-y-4">
                <h3 className="text-[13px] font-bold text-slate-800">Activities</h3>
                <div className="space-y-4">
                    {activities.map((activity) => (
                        <div key={activity.id} className="flex gap-x-3">
                            <Avatar className="h-6 w-6 border">
                                <AvatarFallback className="text-[8px] bg-slate-100">
                                    {activity.user[0]}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="text-[11px] font-medium text-slate-700 leading-tight">
                                    {activity.action}
                                </span>
                                <span className="text-[10px] text-slate-400">{activity.time}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Contacts */}
            <div className="space-y-4">
                <h3 className="text-[13px] font-bold text-slate-800">Contacts</h3>
                <div className="space-y-3">
                    {contacts.map((contact, idx) => (
                        <div key={idx} className="flex items-center gap-x-3 group cursor-pointer">
                            <Avatar className="h-6 w-6 border">
                                <AvatarFallback className="text-[8px] bg-slate-100 group-hover:bg-slate-200 transition-colors">
                                    {contact.name[0]}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-[11px] font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
                                {contact.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
