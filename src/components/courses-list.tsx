"use client";

import { CourseCard } from "@/components/course-card";

type CourseWithProgress = {
    id: string;
    title: string;
    imageUrl: string | null;
    price: number | null;
    progress: number | null;
    category: { name: string } | null;
    description: string | null;
    lessons: { id: string }[];
    isEnrolled: boolean;
    lastActivity?: Date | null;
};

interface CoursesListProps {
    items: CourseWithProgress[];
    currency?: string;
    exchangeRates?: any;
    baseCurrency?: string;
}

export const CoursesList = ({
    items,
    currency,
    exchangeRates,
    baseCurrency
}: CoursesListProps) => {
    return (
        <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
                {items.map((item) => (
                    <CourseCard
                        key={item.id}
                        id={item.id}
                        title={item.title}
                        description={item.description}
                        imageUrl={item.imageUrl}
                        lessonsCount={item.lessons.length}
                        progress={item.progress}
                        category={item?.category?.name || "Uncategorized"}
                        price={item.price}
                        currency={currency}
                        exchangeRates={exchangeRates}
                        baseCurrency={baseCurrency}
                        isEnrolled={item.isEnrolled}
                        lastActivity={item.lastActivity}
                    />
                ))}
            </div>
            {items.length === 0 && (
                <div className="text-center text-muted-foreground mt-10">
                    No courses found.
                </div>
            )}
        </div>
    );
};
