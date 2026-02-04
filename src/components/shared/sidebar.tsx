import Link from "next/link";
import { LogoutButton } from "./logout-button";
import { BookOpen, Layout, List, BarChart } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";

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
    },
    {
        icon: BarChart,
        label: "Analytics",
        href: "/instructor/analytics",
    },
];

export const Sidebar = () => {
    const { data: session } = useSession();

    return (
        <div className="h-full border-r flex flex-col overflow-y-auto bg-white shadow-sm font-sans">
            <Link
                href="/instructor"
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
                        Instructor Account
                    </span>
                </div>
            </Link>

            <div className="px-6 mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Dashboards
                </span>
            </div>
            <div className="flex flex-col w-full">
                {routes.map((route) => (
                    <Link
                        key={route.href}
                        href={route.href}
                        className="flex items-center gap-x-2 text-slate-500 text-sm font-[500] pl-6 transition-all hover:text-slate-600 hover:bg-slate-300/20 py-4"
                    >
                        <route.icon size={22} className="text-slate-500" />
                        {route.label}
                    </Link>
                ))}
            </div>
            <div className="mt-auto p-4 border-t">
                <LogoutButton />
            </div>
        </div>
    );
};
