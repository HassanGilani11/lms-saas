"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ToastProvider } from "@/components/providers/toast-provider";
import { NotificationProvider } from "@/components/providers/notification-provider";
import { SettingsProvider } from "@/components/providers/settings-provider";
import { CurrencyProvider } from "@/components/providers/currency-provider";

interface ProvidersProps {
    children: React.ReactNode;
    session: any;
    settings: any;
}

export const Providers = ({ children, session, settings }: ProvidersProps) => {
    return (
        <SessionProvider session={session}>
            <SettingsProvider settings={settings}>
                <CurrencyProvider>
                    <ToastProvider />
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="system"
                        enableSystem
                        disableTransitionOnChange
                    >
                        <NotificationProvider>
                            {children}
                        </NotificationProvider>
                    </ThemeProvider>
                </CurrencyProvider>
            </SettingsProvider>
        </SessionProvider>
    );
};
