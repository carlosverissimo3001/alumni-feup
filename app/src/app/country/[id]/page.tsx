"use client";

import { useParams } from 'next/navigation';

export default function CountryPage() {
  const params = useParams();
  const countryCode = params.id; // This will be 'PT' for Portugal for eg

  return (
    <div>
      <h1>Country Code: {countryCode}</h1>
      {/* Render country info here */}
    </div>
  );
}
