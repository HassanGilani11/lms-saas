"use client";

import { ComingSoon } from "@/components/shared/coming-soon";
import { Bell } from "lucide-react";

const NotificationsPage = () => {
    return (
        <ComingSoon
            title="Notification Center"
            icon={Bell}
            description="Set up automated email alerts, push notifications, and in-app messaging triggers for your users."
        />
    );
};

export default NotificationsPage;
