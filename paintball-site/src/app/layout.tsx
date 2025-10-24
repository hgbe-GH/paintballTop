import type { Metadata } from "next";
import { Inter, Rajdhani } from "next/font/google";

import "./globals.css";
import { Providers } from "@/components/shared/providers";
import { SiteFooter } from "@/components/shared/site-footer";
import { SiteHeader } from "@/components/shared/site-header";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-rajdhani",
});

export const metadata: Metadata = {
  title: "Paintball Méditerranée",
  description:
    "Sessions de paintball immersives en pleine nature sur la côte méditerranéenne.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} ${rajdhani.variable} bg-background text-foreground antialiased`}>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1">
              {children}
            </main>
            <SiteFooter />
          </div>
        </Providers>
      </body>
    </html>
  );
}
