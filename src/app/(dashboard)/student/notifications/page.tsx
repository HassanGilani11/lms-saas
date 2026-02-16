import { NotificationsList } from "@/components/notifications/notifications-list";

const NotificationsPage = () => {
    return (
        <div className="p-6 space-y-6">
            <div className="space-y-1">
                <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
                <p className="text-slate-500">
                    Stay updated with your course progress and important announcements.
                </p>
            </div>

            <NotificationsList />
        </div>
    );
}

export default NotificationsPage;
