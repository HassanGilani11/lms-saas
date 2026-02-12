"use client";

import { LucideIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";

interface CategoryItemProps {
    label: string,
    value?: string,
    icon?: LucideIcon
}

export const CategoryItem = ({
    label,
    value,
    icon: Icon,
}: CategoryItemProps) => {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentCategoryId = searchParams.get("categoryId");
    const currentTitle = searchParams.get("title");

    const isSelected = currentCategoryId === value;

    const onClick = () => {
        const params = new URLSearchParams(searchParams.toString());

        if (isSelected) {
            params.delete("categoryId");
        } else {
            params.set("categoryId", value as string);
        }

        if (currentTitle) {
            params.set("title", currentTitle);
        }

        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <button
            onClick={onClick}
            className={cn(
                "py-2.5 px-4 text-sm font-semibold border border-slate-200/60 rounded-full flex items-center gap-x-2 hover:border-indigo-600 transition-all duration-300 bg-white/50 backdrop-blur-sm whitespace-nowrap",
                isSelected && "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100/50"
            )}
            type="button"
        >
            {Icon && <Icon size={20} />}
            <div className="line-clamp-1">
                {label}
            </div>
        </button>
    )
}
