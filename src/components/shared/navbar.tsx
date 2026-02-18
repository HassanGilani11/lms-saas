"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useSettings } from "@/components/providers/settings-provider";
import { CurrencySwitcher } from "./currency-switcher";
import Image from "next/image";

export const Navbar = () => {
    const pathname = usePathname();
    const { data: session, status } = useSession();
    const { settings } = useSettings();
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Hide Navbar on course player routes
    const isPlayerPage = pathname?.includes("/topics/");
    if (isPlayerPage) return null;

    return (
        <header
            className={cn(
                "fixed top-0 w-full z-50 transition-all duration-300 border-b border-transparent",
                isScrolled
                    ? "bg-white/80 backdrop-blur-md border-slate-200 py-3 shadow-sm"
                    : "bg-transparent py-5"
            )}
        >
            <div className="container mx-auto px-6 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-x-2">
                    {settings?.siteLogo ? (
                        <div className="relative h-10 w-10">
                            <Image
                                src={settings.siteLogo}
                                alt="Logo"
                                fill
                                className="object-contain"
                            />
                        </div>
                    ) : (
                        <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-2xl">
                                {settings?.siteName?.[0] || "L"}
                            </span>
                        </div>
                    )}
                    <span className="font-bold text-2xl tracking-tight text-slate-900">
                        {settings?.siteName || "LMS SaaS"}
                    </span>
                </Link>

                <nav className="hidden md:flex items-center justify-center gap-x-8 absolute left-1/2 -translate-x-1/2">
                    <Link href="/courses" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                        Courses
                    </Link>
                    <Link href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                        Features
                    </Link>
                    <Link href="#pricing" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                        Pricing
                    </Link>
                    <Link href="#about" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                        About
                    </Link>
                </nav>

                <div className="flex items-center gap-x-4">
                    <CurrencySwitcher />
                    {status === "loading" ? (
                        <div className="h-9 w-24 bg-slate-100 animate-pulse rounded-full" />
                    ) : session ? (
                        <Button asChild variant="default" className="bg-slate-900 hover:bg-slate-800 rounded-xl px-6">
                            <Link href="/dashboard">Dashboard</Link>
                        </Button>
                    ) : (
                        <div className="flex items-center gap-x-2">
                            <Button asChild variant="ghost" className="text-slate-600 hover:text-slate-900 rounded-full px-5 font-semibold">
                                <Link href="/auth/login">Login</Link>
                            </Button>
                            <Button asChild variant="default" className="bg-slate-900 hover:bg-slate-800 rounded-xl px-6 font-semibold shadow-lg shadow-slate-200">
                                <Link href="/auth/register">Start Learning</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};
