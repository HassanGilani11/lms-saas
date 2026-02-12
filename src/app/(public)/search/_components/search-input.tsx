"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";

export const SearchInput = () => {
    const [value, setValue] = useState("");
    const debouncedValue = useDebounce(value, 500);

    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const currentCategoryId = searchParams.get("categoryId");

    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());

        if (debouncedValue) {
            params.set("title", debouncedValue);
        } else {
            params.delete("title");
        }

        if (currentCategoryId) {
            params.set("categoryId", currentCategoryId);
        }

        const url = `${pathname}?${params.toString()}`;
        router.push(url);
    }, [debouncedValue, currentCategoryId, router, pathname]);

    return (
        <div className="relative group">
            <Search
                className="h-4 w-4 absolute top-1/2 -translate-y-1/2 left-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors"
            />
            <Input
                onChange={(e) => setValue(e.target.value)}
                value={value}
                className="w-full pl-11 pr-4 py-6 bg-slate-50 border-none rounded-xl focus-visible:ring-2 focus-visible:ring-indigo-600/20 text-slate-600 placeholder:text-slate-400"
                placeholder="Search for a course..."
            />
        </div>
    )
}
