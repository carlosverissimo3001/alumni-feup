import { Metadata } from "next";
import { getCompanyInsights } from "@/lib/api/insights";
import CompanyPageClient from "./client";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const id = await params.id;
    const data = await getCompanyInsights(id);
    return {
      title: data?.name
        ? `${data.name} Insights`
        : "Company Insights",
      description: data?.name
        ? `View detailed analytics and insights about ${data.name}.`
        : "View detailed company analytics and insights.",
      openGraph: {
        title: data?.name
          ? `${data.name} Insights`
          : "Company Insights",
        description: data?.name
          ? `View detailed analytics and insights about ${data.name}.`
          : "View detailed company analytics and insights.",
    },
  };
}

export default async function CompanyPage({
  params,
}: {
  params: { id: string };
}) {
  const id = await params.id;
  return <CompanyPageClient params={{ id }} />;
}
