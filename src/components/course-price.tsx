"use client";

import { useFormatPrice } from "@/hooks/use-format-price";
import { cn } from "@/lib/utils";

interface CoursePriceProps {
    price: number;
    className?: string;
}

export const CoursePrice = ({
    price,
    className
}: CoursePriceProps) => {
    const { format } = useFormatPrice();

    return (
        <span className={cn(className)}>
            {format(price)}
        </span>
    );
};
