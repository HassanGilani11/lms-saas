"use client";

import Link from "next/link";
import { LogoutButton } from "./logout-button";
import {
    BookOpen,
    Layout,
    List,
    BarChart,
    Wallet,
    ChevronDown,
    ChevronRight,
    Tag,
    Layers,
    FileText,
    CheckCircle,
    Award,
    UserSquare,
    Settings,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import { useSettings } from "@/components/providers/settings-provider";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const routes = [
    {
        icon: Layout,
        label: "Dashboard",
        href: "/instructor",
    },
    {
        icon: List,
        label: "Courses",
        href: "/instructor/courses",
        subLinks: [
            { label: "All Courses", href: "/instructor/courses" },
            { label: "Course Category", href: "/instructor/categories" },
            { label: "Course Tags", href: "/instructor/courses/tags" },
            { label: "Lessons", href: "/instructor/lessons" },
            { label: "Topics", href: "/instructor/topics" },
            { label: "Quizzes", href: "/instructor/quizzes" },
            { label: "Certificates", href: "/instructor/certificates" },
        ]
    },
    {
        icon: BarChart,
        label: "Analytics",
        href: "/instructor/analytics",
    },
    {
        icon: Wallet,
        label: "Revenue",
        href: "/instructor/revenue",
    },
    {
        icon: UserSquare,
        label: "Profile",
        href: "/instructor/profile",
    },
    {
        icon: Settings,
        label: "Settings",
        href: "/instructor/settings",
    },
];

export const Sidebar = () => {
    const { data: session } = useSession();
    const { settings } = useSettings();
    const pathname = usePathname();

    const [openMenus, setOpenMenus] = useState<string[]>(() => {
        const initial: string[] = [];
        if (
            pathname.startsWith("/instructor/courses") ||
            pathname.startsWith("/instructor/categories") ||
            pathname.startsWith("/instructor/lessons") ||
            pathname.startsWith("/instructor/topics") ||
            pathname.startsWith("/instructor/quizzes") ||
            pathname.startsWith("/instructor/certificates")
        ) initial.push("Courses");
        if (
            pathname.startsWith("/instructor/profile") ||
            pathname.startsWith("/instructor/settings")
        ) initial.push("Management"); // Wait, I didn't group them yet, but I can
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
        <div className="h-full border-r border-slate-200 dark:border-slate-800 flex flex-col overflow-y-auto bg-white dark:bg-slate-950 shadow-sm font-sans transition-colors duration-300">
            <Link
                href="/instructor"
                className="p-4 flex items-center gap-x-3 mb-2 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors group cursor-pointer"
            >
                <Avatar className="h-10 w-10 border border-slate-200 dark:border-slate-700 transition-transform group-hover:scale-105">
                    <AvatarImage src={session?.user?.image || ""} crossOrigin="anonymous" />
                    <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold italic text-lg uppercase">
                        {session?.user?.name?.[0] || (session?.user as any)?.username?.[0] || session?.user?.email?.[0] || "U"}
                    </AvatarFallback>
                </Avatar>
                <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-tight group-hover:text-slate-900 dark:group-hover:text-white transition-colors truncate">
                        {session?.user?.name || (session?.user as any)?.username || session?.user?.email?.split('@')[0] || "User Name"}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium tracking-wide uppercase">
                        Instructor Account
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
                    const isActive = pathname === route.href || (route.href !== "/instructor" && pathname.startsWith(route.href));
                    const hasSubLinks = !!route.subLinks;

                    return (
                        <div key={route.href}>
                            {hasSubLinks ? (
                                <div className="space-y-1">
                                    <button
                                        onClick={() => toggleMenu(route.label)}
                                        className={cn(
                                            "flex items-center justify-between w-full text-slate-500 dark:text-slate-400 text-[13px] font-[500] pl-6 transition-all hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-900/50 py-2.5 group mr-2 rounded-r-full",
                                            (isActive || openMenus.includes(route.label)) && "text-slate-900 dark:text-slate-100 bg-slate-100/50 dark:bg-slate-900/50"
                                        )}
                                    >
                                        <div className="flex items-center gap-x-3">
                                            <route.icon size={18} className={cn("text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors", isActive && "text-slate-900 dark:text-slate-200")} />
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
                                                            "flex items-center pl-16 py-2 text-[12px] font-medium text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 transition-colors",
                                                            isSubActive && "text-slate-900 dark:text-slate-200 font-bold"
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
                                        "flex items-center gap-x-3 text-slate-500 dark:text-slate-400 text-[13px] font-[500] pl-6 transition-all hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-900/50 py-2.5 group mr-2 rounded-r-full",
                                        isActive && "text-slate-900 dark:text-slate-100 bg-slate-100/50 dark:bg-slate-900/50 font-bold"
                                    )}
                                >
                                    <route.icon size={18} className={cn("text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors", isActive && "text-slate-900 dark:text-slate-200")} />
                                    {route.label}
                                </Link>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="mt-auto p-4 border-t border-slate-200 dark:border-slate-800">
                <LogoutButton />
            </div>
        </div>
    );
};
