"use client";

import { SystemSettings } from "@/lib/prisma";
import { createContext, useContext, ReactNode } from "react";

interface SettingsContextProps {
    settings: SystemSettings | null;
}

const SettingsContext = createContext<SettingsContextProps | undefined>(undefined);

export const SettingsProvider = ({
    children,
    settings,
}: {
    children: ReactNode;
    settings: SystemSettings | null;
}) => {
    return (
        <SettingsContext.Provider value={{ settings }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error("useSettings must be used within a SettingsProvider");
    }
    return context;
};
