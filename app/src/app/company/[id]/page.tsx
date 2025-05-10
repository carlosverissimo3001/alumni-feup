"use client";

import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Building2 } from 'lucide-react';

export default function CompanyPage() {
  const params = useParams();
  const companyId = params.id; // This will be '123' for /company/123

  return (
    <div className="p-6 space-y-3 bg-gray-100 min-h-screen">
      <div className="flex items-center gap-4">
        <Building2 className="h-8 w-8 text-[#8C2D19]" />
        <div>
          <h1 className="text-3xl font-extrabold text-[#8C2D19]">
            {/* company.name */}
            Company Name
          </h1>
        </div>
      </div>
    </div>
  );
}
