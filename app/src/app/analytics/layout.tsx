import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics",
  description: "Alumni FEUP Analytics",
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

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen">{children}</div>;
}
