"use client";

import { Category } from "@/lib/prisma";
import {
    Music,
    Camera,
    Dumbbell,
    Calculator,
    Layout,
    Video,
    Wrench,
    IconNode
} from "lucide-react";
import { LucideIcon } from "lucide-react";

import { CategoryItem } from "./category-item";

interface CategoriesProps {
    items: (Category & { _count?: { courses: number } })[];
}

const iconMap: Record<string, LucideIcon> = {
    "Music": Music,
    "Photography": Camera,
    "Fitness": Dumbbell,
    "Accounting": Calculator,
    "Computer Science": Layout,
    "Filming": Video,
    "Engineering": Wrench,
};

export const Categories = ({
    items,
}: CategoriesProps) => {
    return (
        <div className="flex items-center gap-x-3 overflow-x-auto pb-2 scrollbar-none">
            {items.map((item) => (
                <CategoryItem
                    key={item.id}
                    label={item.name}
                    icon={iconMap[item.name]}
                    value={item.id}
                />
            ))}
        </div>
    )
}
