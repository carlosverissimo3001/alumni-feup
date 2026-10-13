import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Layout from "@/components/navbar/layout";
import { Providers } from "@/providers";
import { Toaster } from "@/components/ui/toaster";
import { LoadingProvider } from "@/contexts/LoadingContext";
import GlobalLoadingModal from "@/components/analytics/common/GlobalLoadingModal";

// Vercel and Other Analytics
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

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
            <Toaster />
            {/* Self-hosted Umami, running alongside Vercel Analytics until the frontend
                itself migrates off Vercel (CAR-391/392) - data-performance enables Web
                Vitals collection (LCP/INP/CLS/FCP/TTFB), not just pageviews. */}
            {process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID && (
              <Script
                src={
                  process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL ??
                  "https://analytics.alumni-feup.com/script.js"
                }
                data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
                data-performance="true"
                strategy="afterInteractive"
              />
            )}
          </LoadingProvider>
        </Providers>
      </body>
    </html>
  );
}
