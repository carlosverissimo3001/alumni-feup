import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  BookOpenIcon,
  CreditCardIcon,
  FileSpreadsheetIcon,
  UsersIcon,
} from "lucide-react";

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
      title: "Alumni Management",
      description:
        "Consult alumni with no LinkedIn profile, delete user data, and more",
      icon: <UsersIcon className="h-6 w-6" />,
      href: "/admin/alumni-management",
      disabled: true,
    },
    {
      title: "API Usage",
      description: "View API usage and balance",
      icon: <CreditCardIcon className="h-6 w-6" />,
      href: "/admin/api-usage",
    },
    {
      title: "Faculty and Course Management",
      description: "Manage faculties and courses",
      icon: <BookOpenIcon className="h-6 w-6" />,
      href: "/admin/faculty-management",
    },
  ];

  return (
    <div className="container mx-auto py-8 min-h-screen bg-white">
      <h1 className="text-3xl font-bold mb-8 text-black">Admin Panel</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {operations.map((op) => (
          <Link key={op.href} href={op.href} className="block">
            <Card className="h-full transition-all duration-200 hover:shadow-lg hover:border-primary/50">
              <CardHeader className="h-full">
                <div className="flex items-center gap-4 h-full">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary self-center">
                    {op.icon}
                  </div>
                  <div className="self-center">
                    <CardTitle className="text-xl mb-1 text-black">
                      {op.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      {op.description}
                    </CardDescription>
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
