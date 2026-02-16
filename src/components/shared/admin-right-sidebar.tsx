import {
    Bug, UserPlus, UserMinus, Plus,
    Rss, Clock, CheckCircle2
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getContacts } from "@/actions/contact";
import { getRecentActivities } from "@/actions/analytics";

import AdminNotificationsList from "../notifications/admin-notifications-list";

export const AdminRightSidebar = async () => {
    const contactsData = await getContacts();
    const recentContacts = contactsData.slice(0, 6);

    const activities = await getRecentActivities();

    return (
        <div className="w-[300px] h-full border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col overflow-y-auto p-6 space-y-8 font-sans transition-colors duration-300">
            {/* Notifications */}
            <div className="space-y-4">
                <h3 className="text-[13px] font-bold text-slate-800 dark:text-slate-200">Notifications</h3>
                <AdminNotificationsList />
            </div>

            {/* Activities */}
            <div className="space-y-4">
                <h3 className="text-[13px] font-bold text-slate-800 dark:text-slate-200">Activities</h3>
                <div className="space-y-4">
                    {activities.length === 0 ? (
                        <div className="text-[11px] text-slate-400 dark:text-slate-500">No recent activities</div>
                    ) : (
                        activities.map((activity) => (
                            <div key={activity.id} className="flex gap-x-3">
                                <Avatar className="h-6 w-6 border border-slate-200 dark:border-slate-700">
                                    <AvatarImage src={activity.avatar || ""} />
                                    <AvatarFallback className="text-[8px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                        {activity.user[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 leading-tight">
                                        {activity.action}
                                    </span>
                                    <span className="text-[10px] text-slate-400 dark:text-slate-500">
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
                <h3 className="text-[13px] font-bold text-slate-800 dark:text-slate-200">Contacts</h3>
                <div className="space-y-3">
                    {recentContacts.length === 0 ? (
                        <div className="text-[11px] text-slate-400 dark:text-slate-500">No contacts</div>
                    ) : (
                        recentContacts.map((contact) => (
                            <div key={contact.id} className="flex items-center gap-x-3 group cursor-pointer">
                                <Avatar className="h-6 w-6 border border-slate-200 dark:border-slate-700">
                                    <AvatarImage src={contact.image || ""} />
                                    <AvatarFallback className="text-[8px] bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300">
                                        {contact.name?.[0] || "?"}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">
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
