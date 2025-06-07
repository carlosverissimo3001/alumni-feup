import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Layout from "@/components/navbar/layout";
import { Providers } from "@/providers";
import { Toaster } from "@/components/ui/toaster";
import { LoadingProvider } from "@/contexts/LoadingContext";
import GlobalLoadingModal from "@/components/analytics/common/GlobalLoadingModal";

// Vercel and Other Analytics
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { HotJar } from "@/lib/hotjar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Alumni FEUP",
  description: "FEUP Alumni Platform for deep insights",
  icons: {
    icon: [
      {
        url: "/favicon.png",
        type: "image/png",
      },
    ],
    shortcut: ["/favicon.png"],
    apple: [
      {
        url: "/favicon.png",
        type: "image/png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-900`}
      >
        <Providers>
          <LoadingProvider>
            <Layout>{children}</Layout>
            <GlobalLoadingModal />
            <SpeedInsights />
            <Analytics />
            <HotJar />
            <Toaster />
          </LoadingProvider>
        </Providers>
      </body>
    </html>
  );
}
