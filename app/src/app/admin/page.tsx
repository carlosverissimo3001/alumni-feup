"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CreditCardIcon, FileSpreadsheetIcon, MergeIcon, UsersIcon } from "lucide-react";

const AdminDashboard = () => {
  const operations = [
    {
      title: "Upload Extraction CSV",
      description: "Upload and process academic data extraction CSV files",
      icon: <FileSpreadsheetIcon className="h-6 w-6" />,
      href: "/admin/upload-csv",
    },
    {
      title: "Review Alumni",
      description: "Review and approve Alumni submissions",
      icon: <UsersIcon className="h-6 w-6" />,
      href: "/admin/review-alumni",
    },
    {
      title: "Merge Companies (In Development)",
      description: "Merge companies based on their names",
      icon: <MergeIcon className="h-6 w-6" />,
      href: "/admin/merge-companies",
      disabled: true,
    },
    {
      title: "API Usage",
      description: "View API usage and balance",
      icon: <CreditCardIcon className="h-6 w-6" />,
      href: "/admin/api-usage",
    }
  ];

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-12">
        {operations.map((op) => (
          <Link key={op.href} href={op.href} className="block">
            <Card className="h-full transition-all duration-200 hover:shadow-lg hover:border-primary/50">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {op.icon}
                  </div>
                  <div>
                    <CardTitle className="text-xl mb-1">{op.title}</CardTitle>
                    <CardDescription>{op.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
