import {
    Bug, UserPlus, UserMinus, Plus,
    Rss, Clock, CheckCircle2
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getContacts } from "@/actions/contact";
import { getRecentActivities } from "@/actions/analytics";

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

export const AdminRightSidebar = async () => {
    const contactsData = await getContacts();
    const recentContacts = contactsData.slice(0, 6);

    const activities = await getRecentActivities();

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
                    {activities.length === 0 ? (
                        <div className="text-[11px] text-slate-400">No recent activities</div>
                    ) : (
                        activities.map((activity) => (
                            <div key={activity.id} className="flex gap-x-3">
                                <Avatar className="h-6 w-6 border">
                                    <AvatarImage src={activity.avatar || ""} />
                                    <AvatarFallback className="text-[8px] bg-slate-100">
                                        {activity.user[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-medium text-slate-700 leading-tight">
                                        {activity.action}
                                    </span>
                                    <span className="text-[10px] text-slate-400">
                                        {formatDistanceToNow(new Date(activity.time), { addSuffix: true })}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Contacts */}
            <div className="space-y-4">
                <h3 className="text-[13px] font-bold text-slate-800">Contacts</h3>
                <div className="space-y-3">
                    {recentContacts.length === 0 ? (
                        <div className="text-[11px] text-slate-400">No contacts</div>
                    ) : (
                        recentContacts.map((contact) => (
                            <div key={contact.id} className="flex items-center gap-x-3 group cursor-pointer">
                                <Avatar className="h-6 w-6 border">
                                    <AvatarImage src={contact.image || ""} />
                                    <AvatarFallback className="text-[8px] bg-slate-100 group-hover:bg-slate-200 transition-colors">
                                        {contact.name?.[0] || "?"}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="text-[11px] font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
                                    {contact.name}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
