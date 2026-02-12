"use client";

import { usePathname } from "next/navigation";

export const RouteVisibilityContainer = ({
    children,
    hideOnPatterns
}: {
    children: React.ReactNode;
    hideOnPatterns: string[];
}) => {
    const pathname = usePathname();

    const shouldHide = hideOnPatterns.some(pattern => pathname?.includes(pattern));

    if (shouldHide) return null;

    return <>{children}</>;
};
