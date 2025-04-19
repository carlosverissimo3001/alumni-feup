"use client";

import {
  BarChart3,
  Users,
  Globe2,
  ChartSpline,
  Factory,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import CompanyDashboard from "@/components/analytics/CompanyDashboard";
import IndustryDashboard from "@/components/analytics/IndustryDashboard";
import { useState } from "react";
import CountriesDashboard from "@/components/analytics/CountryDashboard";

export default function Analytics() {
  const [totalAlumni, setTotalAlumni] = useState<number>(0);
  const [totalCompanies, setTotalCompanies] = useState<number>(0);
  const [totalIndustries, setTotalIndustries] = useState<number>(0);
  const [totalCountries, setTotalCountries] = useState<number>(0);
  
  const stats = [
    {
      name: "FEUP EI Alumni",
      value: totalAlumni,
      icon: Users,
    },
    {
      name: "Companies",
      value: totalCompanies,
      icon: BarChart3,
    },
    {
      name: "Countries",
      value: totalCountries,
      icon: Globe2,
    },
    {
      name: "Industries",
      value: totalIndustries,
      icon: Factory,
    },
    
  ];

  const handleCompanyDataUpdate = (alumniCount: number, companyCount: number) => {
    setTotalAlumni(alumniCount);
    setTotalCompanies(companyCount);
  };

  const handleIndustryDataUpdate = (industryCount: number) => {
    setTotalIndustries(industryCount);
  };

  const handleCountriesDataUpdate = (countryCount: number) => {
    setTotalCountries(countryCount);
  };

  return (
    <div className="p-6 space-y-6 bg-gray-100 min-h-screen">
      <div className="flex items-center gap-4">
        <ChartSpline className="h-8 w-8 text-[#8C2D19]" />
        <div>
          <h1 className="text-3xl font-extrabold text-[#8C2D19]">
            Alumni Analytics
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="p-4 bg-gradient-to-br from-white to-[#8C2D19]/10 hover:shadow-xl transition-shadow duration-300 rounded-xl border border-gray-200"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-[#8C2D19]/20 hover:bg-[#8C2D19]/30 transition-colors">
                <stat.icon className="h-6 w-6 text-[#8C2D19]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#000000]">{stat.name}</p>
                <h3 className="text-3xl font-extrabold text-[#000000]">{stat.value}</h3>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* <Filters /> */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <CompanyDashboard onDataUpdate={handleCompanyDataUpdate} />
        <CountriesDashboard onDataUpdate={handleCountriesDataUpdate} />
        <IndustryDashboard onDataUpdate={handleIndustryDataUpdate} />
        {/* Testing visualizations */}
      </div>
    </div>
  );
}