"use client";

import { useParams } from 'next/navigation';

export default function CompanyPage() {
  const params = useParams();
  const companyId = params.id; // This will be '123' for /company/123

  return (
    <div>
      <h1>Company ID: {companyId}</h1>
      {/* Render company info here */}
    </div>
  );
}
