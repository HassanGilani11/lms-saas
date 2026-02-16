import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { auth } from "@/auth";
import { getSettings } from "@/actions/settings";

import { Providers } from "@/components/providers/providers";

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
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers session={session} settings={settings}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
