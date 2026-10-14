import type { Metadata } from "next";
import { Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Layout from "@/components/navbar/layout";
import { Providers } from "@/providers";
import { Toaster } from "@/components/ui/toaster";
import { LoadingProvider } from "@/contexts/LoadingContext";
import GlobalLoadingModal from "@/components/analytics/common/GlobalLoadingModal";

const bricolageSans = Bricolage_Grotesque({
  variable: "--font-bricolage-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
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
    <html
      lang="en"
      suppressHydrationWarning
      className={`${bricolageSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="antialiased bg-zinc-900">
        <Providers>
          <LoadingProvider>
            <Layout>{children}</Layout>
            <GlobalLoadingModal />
            <Toaster />
            {process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID && (
              <Script
                src={
                  process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL ??
                  "https://analytics.carlosverissimo.com/script.js"
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
