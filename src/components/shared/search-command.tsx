"use client";

import { useEffect, useState } from "react";
import { Calculator, Calendar, CreditCard, Settings, Smile, User, Layout, BookOpen, Search } from "lucide-react";

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export const SearchCommand = () => {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const runCommand = (command: () => void) => {
        setOpen(false);
        command();
    }

    return (
        <>
            <div
                className="relative w-64 group cursor-pointer"
                onClick={() => setOpen(true)}
            >
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                <div className="h-9 w-full bg-slate-100 dark:bg-slate-800/50 rounded-md flex items-center pl-9 text-sm text-slate-500 dark:text-slate-400 border border-transparent group-hover:border-slate-200 dark:group-hover:border-slate-700 transition-all">
                    Search...
                </div>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 dark:text-slate-500 font-mono bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 shadow-sm">
                    ⌘K
                </div>
            </div>

            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Type a command or search..." />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Suggestions">
                        <CommandItem onSelect={() => runCommand(() => router.push("/dashboard"))}>
                            <Layout className="mr-2 h-4 w-4" />
                            <span>Dashboard</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push("/search"))}>
                            <BookOpen className="mr-2 h-4 w-4" />
                            <span>Browse Courses</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push("/student/settings"))}>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                        </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="Instructor">
                        <CommandItem onSelect={() => runCommand(() => router.push("/instructor/courses"))}>
                            <BookOpen className="mr-2 h-4 w-4" />
                            <span>My Courses</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push("/instructor/analytics"))}>
                            <Calculator className="mr-2 h-4 w-4" />
                            <span>Analytics</span>
                        </CommandItem>
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    );
};
