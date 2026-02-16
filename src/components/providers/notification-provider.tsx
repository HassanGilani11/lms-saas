"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getNotifications, markNotificationsAsRead } from "@/actions/notifications";
import { toast } from "react-hot-toast";

interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    href?: string | null;
    isRead: boolean;
    createdAt: Date;
    metadata?: any;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    markAsRead: (ids: string[]) => Promise<void>;
    fetchNotifications: () => Promise<void>;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        console.log("NotificationProvider Mounted");
    }, []);

    const fetchNotifications = useCallback(async () => {
        const data = await getNotifications();
        setNotifications(data.map(n => ({ ...n, createdAt: new Date(n.createdAt) })));
    }, []);

    const markAsRead = async (ids: string[]) => {
        const res = await markNotificationsAsRead(ids);
        if (res.success) {
            setNotifications(prev =>
                prev.map(n => ids.includes(n.id) ? { ...n, isRead: true } : n)
            );
        }
    };

    useEffect(() => {
        fetchNotifications();

        // Set up SSE
        const eventSource = new EventSource("/api/notifications/sse");

        eventSource.onmessage = (event) => {
            const newNotif = JSON.parse(event.data);
            setNotifications(prev => [
                { ...newNotif, createdAt: new Date(newNotif.createdAt) },
                ...prev
            ].slice(0, 50)); // Keep last 50

            toast.success(newNotif.title, {
                description: newNotif.message,
                icon: '🔔',
            } as any);
        };

        eventSource.onerror = (error) => {
            console.error("SSE Error:", error);
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }, [fetchNotifications]);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, fetchNotifications }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotifications must be used within a NotificationProvider");
    }
    return context;
};
