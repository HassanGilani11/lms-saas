"use client";

import { useEffect, useState } from "react";
import { Star, Trash2, ExternalLink } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface FavoriteItem {
    path: string;
    label: string;
}

export const FavoritesPopover = () => {
    const pathname = usePathname();
    const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
    const [mounted, setMounted] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
        const storedFavorites = localStorage.getItem("page-favorites");
        if (storedFavorites) {
            setFavorites(JSON.parse(storedFavorites));
        }
    }, []);

    const isCurrentFavorite = favorites.some(f => f.path === pathname);

    const toggleFavorite = () => {
        let newFavorites;
        if (isCurrentFavorite) {
            newFavorites = favorites.filter(f => f.path !== pathname);
        } else {
            const label = pathname === "/" ? "Home" :
                pathname.split("/").filter(Boolean).map(segment =>
                    segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ")
                ).join(" > ");

            newFavorites = [...favorites, { path: pathname, label }];
        }

        setFavorites(newFavorites);
        localStorage.setItem("page-favorites", JSON.stringify(newFavorites));
    };

    if (!mounted) return null;

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <div className="relative group">
                    <Star
                        className={cn(
                            "h-4 w-4 cursor-pointer transition-all",
                            isCurrentFavorite
                                ? "text-yellow-400 fill-yellow-400 hover:text-yellow-500"
                                : "text-slate-400 hover:text-slate-600"
                        )}
                        onClick={(e) => {
                            // If clicking star directly, just toggle
                            e.preventDefault();
                            toggleFavorite();
                        }}
                        onContextMenu={(e) => {
                            // Right click opens menu to see list
                            e.preventDefault();
                            setIsOpen(true);
                        }}
                    />
                    {/* Hover tooltip hint */}
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                        {isCurrentFavorite ? "Remove from favorites" : "Add to favorites (Right-click for list)"}
                    </div>
                </div>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-80 p-0 ml-4">
                <div className="p-4 border-b flex items-center justify-between">
                    <div>
                        <h4 className="font-medium text-sm">Favorites</h4>
                        <p className="text-xs text-slate-500">Quick access to your saved pages</p>
                    </div>
                    <Button
                        size="sm"
                        variant={isCurrentFavorite ? "secondary" : "default"}
                        className="h-7 text-xs"
                        onClick={toggleFavorite}
                    >
                        {isCurrentFavorite ? "Remove Current" : "Add Current"}
                    </Button>
                </div>
                <div className="max-h-[300px] overflow-y-auto p-1">
                    {favorites.length === 0 ? (
                        <div className="p-8 text-center text-xs text-slate-500">
                            <Star className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                            No favorites yet.<br />Click the star icon to add this page!
                        </div>
                    ) : (
                        favorites.map((item, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-2 rounded-md hover:bg-slate-100 text-sm transition-colors group"
                            >
                                <Link href={item.path} className="flex-1 flex flex-col truncate mr-2" onClick={() => setIsOpen(false)}>
                                    <span className="font-medium truncate text-slate-700">{item.label}</span>
                                    <span className="text-[10px] text-slate-400 truncate">{item.path}</span>
                                </Link>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-slate-400 hover:text-red-500"
                                        onClick={() => {
                                            const newFavorites = favorites.filter(f => f.path !== item.path);
                                            setFavorites(newFavorites);
                                            localStorage.setItem("page-favorites", JSON.stringify(newFavorites));
                                        }}
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                    <Link href={item.path} onClick={() => setIsOpen(false)}>
                                        <ExternalLink className="h-3 w-3 text-slate-400 hover:text-slate-600" />
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
};
