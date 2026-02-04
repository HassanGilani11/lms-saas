"use client";

import Link from "next/link";
import { LogoutButton } from "./logout-button";
import {
    Users, BookOpen, CreditCard, Settings, Layout, BarChart,
    List, AlertCircle, Award, Shield, Contact, Map,
    Users as UsersCloud, GitBranch, Bell, Share2, MessagesSquare,
    ChevronDown, ChevronRight
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

const routes = [
    {
        icon: Layout,
        label: "Dashboard",
        href: "/admin",
    },
    {
        icon: Users,
        label: "Users",
        href: "/admin/users",
        subLinks: [
            { label: "Administrator", href: "/admin/users/administrator" },
            { label: "Instructor", href: "/admin/users/instructor" },
            { label: "Learner", href: "/admin/users/learner" },
            { label: "My Info", href: "/admin/users/my-info" },
        ]
    },
    {
        icon: Shield,
        label: "User Types",
        href: "/admin/user-types",
    },
    {
        icon: Contact,
        label: "Contacts",
        href: "/admin/contacts",
    },
    {
        icon: BookOpen,
        label: "Courses",
        href: "/admin/courses",
        subLinks: [
            { label: "All Courses", href: "/admin/courses" },
            { label: "Course Category", href: "/admin/categories" },
            { label: "Course Tags", href: "/admin/courses/tags" },
        ]
    },
    {
        icon: Map,
        label: "Learning Path",
        href: "/admin/learning-paths",
    },
    {
        icon: UsersCloud,
        label: "Groups",
        href: "/admin/groups",
        subLinks: [
            { label: "All Groups", href: "/admin/groups" },
            { label: "Group Categories", href: "/admin/groups/categories" },
            { label: "Group Tags", href: "/admin/groups/tags" },
        ]
    },
    {
        icon: CreditCard,
        label: "Payment Gateway",
        href: "/admin/payments",
    },
    {
        icon: GitBranch,
        label: "Branch",
        href: "/admin/branches",
    },
    {
        icon: AlertCircle,
        label: "Report",
        href: "/admin/reports",
    },
    {
        icon: Settings,
        label: "Global Settings",
        href: "/admin/settings",
    },
    {
        icon: Bell,
        label: "Notifications",
        href: "/admin/notifications",
    },
    {
        icon: Share2,
        label: "Import / Export",
        href: "/admin/tools",
    },
    {
        icon: MessagesSquare,
        label: "Collaboration Tools",
        href: "/admin/collaboration",
    },
];

export const AdminSidebar = () => {
    const { data: session } = useSession();
    const pathname = usePathname();
    const [openMenus, setOpenMenus] = useState<string[]>(() => {
        const initial: string[] = [];
        if (pathname.startsWith("/admin/users")) initial.push("Users");
        if (pathname.startsWith("/admin/courses") || pathname.startsWith("/admin/categories")) initial.push("Courses");
        if (pathname.startsWith("/admin/groups")) initial.push("Groups");
        return initial;
    });

    const toggleMenu = (label: string) => {
        setOpenMenus((prev) =>
            prev.includes(label)
                ? prev.filter((i) => i !== label)
                : [...prev, label]
        );
    };

    return (
        <div className="h-full border-r flex flex-col overflow-y-auto bg-white shadow-sm font-sans">
            <Link
                href="/admin/users/my-info"
                className="p-4 flex items-center gap-x-3 mb-2 hover:bg-slate-50 transition-colors group cursor-pointer"
            >
                <Avatar className="h-10 w-10 border transition-transform group-hover:scale-105">
                    <AvatarImage src={session?.user?.image || ""} />
                    <AvatarFallback className="bg-slate-100 text-slate-600 font-semibold italic text-lg">
                        {(session?.user as any)?.username?.[0] || session?.user?.name?.[0] || session?.user?.email?.[0] || "U"}
                    </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-700 leading-tight group-hover:text-slate-900 transition-colors">
                        {(session?.user as any)?.username || session?.user?.name || session?.user?.email || "User Name"}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
                        {session?.user?.role?.toLowerCase() || "User"} Account
                    </span>
                </div>
            </Link>

            <div className="px-6 mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Dashboards
                </span>
            </div>

            <div className="flex flex-col w-full flex-grow">
                {routes.map((route) => {
                    const isActive = pathname === route.href || pathname.startsWith(route.href + "/");
                    const hasSubLinks = !!route.subLinks;

                    return (
                        <div key={route.href}>
                            {hasSubLinks ? (
                                <div className="space-y-1">
                                    <button
                                        onClick={() => toggleMenu(route.label)}
                                        className={cn(
                                            "flex items-center justify-between w-full text-slate-500 text-[13px] font-[500] pl-6 transition-all hover:text-slate-900 hover:bg-slate-100/50 py-2.5 group mr-2 rounded-r-full",
                                            isActive && "text-slate-900 bg-slate-100/50"
                                        )}
                                    >
                                        <div className="flex items-center gap-x-3">
                                            <route.icon size={18} className={cn("text-slate-400 group-hover:text-slate-900 transition-colors", isActive && "text-slate-900")} />
                                            {route.label}
                                        </div>
                                        <div className="pr-4">
                                            {openMenus.includes(route.label) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                        </div>
                                    </button>
                                    {openMenus.includes(route.label) && (
                                        <div className="space-y-1 animate-in slide-in-from-top-1 duration-200">
                                            {route.subLinks?.map((sub) => {
                                                const isSubActive = pathname === sub.href;
                                                return (
                                                    <Link
                                                        key={sub.href}
                                                        href={sub.href}
                                                        className={cn(
                                                            "flex items-center pl-16 py-2 text-[12px] font-medium text-slate-500 hover:text-slate-900 transition-colors",
                                                            isSubActive && "text-slate-900 font-bold"
                                                        )}
                                                    >
                                                        {sub.label}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Link
                                    href={route.href}
                                    className={cn(
                                        "flex items-center gap-x-3 text-slate-500 text-[13px] font-[500] pl-6 transition-all hover:text-slate-900 hover:bg-slate-100/50 py-2.5 group mr-2 rounded-r-full",
                                        isActive && "text-slate-900 bg-slate-100/50 font-bold"
                                    )}
                                >
                                    <route.icon size={18} className={cn("text-slate-400 group-hover:text-slate-900 transition-colors", isActive && "text-slate-900")} />
                                    {route.label}
                                </Link>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 px-6 mb-4">
                <span className="text-xl font-bold tracking-tighter text-slate-900">LMS</span>
            </div>

            <div className="p-4 border-t">
                <LogoutButton />
            </div>
        </div>
    );
};
