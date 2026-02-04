import Link from "next/link";
import { LogoutButton } from "./logout-button";
import { BookOpen, Layout, List, BarChart } from "lucide-react";

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
    return (
        <div className="h-full border-r flex flex-col overflow-y-auto bg-white shadow-sm">
            <div className="p-6 flex items-center gap-x-2">
                <div className="h-8 w-8 bg-black rounded-lg flex items-center justify-center">
                    <BookOpen className="text-white h-5 w-5" />
                </div>
                <span className="font-bold text-xl tracking-tight">LuminaLearn</span>
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
