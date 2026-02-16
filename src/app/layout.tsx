import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { ToastProvider } from "@/components/providers/toast-provider";
import { NotificationProvider } from "@/components/providers/notification-provider";
import { getSettings } from "@/actions/settings";
import { SettingsProvider } from "@/components/providers/settings-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();

  return {
    title: {
      default: settings?.siteName || "LuminaLearn LMS",
      template: `%s | ${settings?.siteName || "LuminaLearn LMS"}`,
    },
    description: "Next Generation Learning Management System",
    icons: {
      icon: settings?.siteLogo || "/favicon.ico",
    }
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const settings = await getSettings();

  return (
    <SessionProvider session={session}>
      <html lang="en">
        <body className={inter.className}>
          <SettingsProvider settings={settings}>
            <ToastProvider />
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {/* Notification Provider wraps app */}
              <NotificationProvider>
                {children}
              </NotificationProvider>
            </ThemeProvider>
          </SettingsProvider>
        </body>
      </html>
    </SessionProvider>
  );
}
