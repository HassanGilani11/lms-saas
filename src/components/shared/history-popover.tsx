"use client";

import { useEffect, useState } from "react";
import { History, ExternalLink } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

interface HistoryItem {
    path: string;
    label: string;
    timestamp: number;
}

export const HistoryPopover = () => {
    const pathname = usePathname();
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const storedHistory = localStorage.getItem("page-history");
        if (storedHistory) {
            setHistory(JSON.parse(storedHistory));
        }
    }, []);

    useEffect(() => {
        if (!mounted) return;

        // Don't track if same as last page
        const lastItem = history[0];
        if (lastItem?.path === pathname) return;

        // Create label from pathname
        const label = pathname === "/" ? "Home" :
            pathname.split("/").filter(Boolean).map(segment =>
                segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ")
            ).join(" > ");

        const newItem: HistoryItem = {
            path: pathname,
            label,
            timestamp: Date.now()
        };

        const newHistory = [newItem, ...history.filter(h => h.path !== pathname)].slice(0, 10);

        setHistory(newHistory);
        localStorage.setItem("page-history", JSON.stringify(newHistory));
    }, [pathname, mounted]); // eslint-disable-line react-hooks/exhaustive-deps

    if (!mounted) return null;

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-4 w-4 text-slate-400 hover:text-slate-600">
                    <History className="h-[1.2rem] w-[1.2rem]" />
                    <span className="sr-only">History</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
                <div className="p-4 border-b">
                    <h4 className="font-medium text-sm">Recent Pages</h4>
                    <p className="text-xs text-slate-500">Your last 10 visited pages</p>
                </div>
                <div className="max-h-[300px] overflow-y-auto p-1">
                    {history.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-500">
                            No history yet. Start browsing!
                        </div>
                    ) : (
                        history.map((item, index) => (
                            <Link
                                key={index}
                                href={item.path}
                                className="flex items-center justify-between p-2 rounded-md hover:bg-slate-100 text-sm transition-colors group"
                            >
                                <div className="flex flex-col truncate">
                                    <span className="font-medium truncate text-slate-700">{item.label}</span>
                                    <span className="text-[10px] text-slate-400 truncate">{item.path}</span>
                                </div>
                                <ExternalLink className="h-3 w-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                        ))
                    )}
                </div>
                {history.length > 0 && (
                    <>
                        <Separator />
                        <div className="p-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full text-xs h-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={() => {
                                    setHistory([]);
                                    localStorage.removeItem("page-history");
                                }}
                            >
                                Clear History
                            </Button>
                        </div>
                    </>
                )}
            </PopoverContent>
        </Popover>
    );
};
