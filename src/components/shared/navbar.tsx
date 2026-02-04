"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export const Navbar = () => {
    const { data: session, status } = useSession();
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

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
                    <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-xl">L</span>
                    </div>
                    <span className="font-bold text-xl tracking-tight text-slate-900">LuminaLearn</span>
                </Link>

                <nav className="hidden md:flex items-center gap-x-8">
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
                    {status === "loading" ? (
                        <div className="h-9 w-24 bg-slate-100 animate-pulse rounded-md" />
                    ) : session ? (
                        <Button asChild variant="default" className="bg-slate-900 hover:bg-slate-800">
                            <Link href="/dashboard">Dashboard</Link>
                        </Button>
                    ) : (
                        <>
                            <Button asChild variant="ghost" className="text-slate-600 hover:text-slate-900">
                                <Link href="/auth/login">Login</Link>
                            </Button>
                            <Button asChild variant="default" className="bg-slate-900 hover:bg-slate-800">
                                <Link href="/auth/register">Get Started</Link>
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};
