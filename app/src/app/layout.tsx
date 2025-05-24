import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Layout from "@/components/navbar/layout";
import { Providers } from "@/providers";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "30EIC",
  description: "The 30EIC Alumni Map",
  icons: {
    icon: [
      {
        url: "/images/logo-simple.png",
        type: "image/png",
      },
    ],
    shortcut: ["/images/logo-simple.png"],
    apple: [
      {
        url: "/images/logo-simple.png",
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
          <Layout>{children}</Layout>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
