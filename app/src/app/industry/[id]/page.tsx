"use client";

import { useParams } from 'next/navigation';

export default function IndustryPage() {
  const params = useParams();
  const industryId = params.id; // This will be '123' for /industry/123

  return (
    <div>
      <h1>Industry ID: {industryId}</h1>
      {/* Render industry info here */}
    </div>
  );
}
