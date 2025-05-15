import { Building2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';

export default function CompanyNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative">
          <Building2 className="h-20 w-20 text-muted-foreground/30" />
          <AlertCircle className="h-8 w-8 text-destructive absolute -top-2 -right-2" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Company Not Found</h1>
        <p className="text-muted-foreground max-w-md">
          We couldn&apos;t find the company you&apos;re looking for. The company might not exist or there might be an issue with our data.
        </p>
        <Button asChild className="mt-4">
          <Link href="/analytics">
            Return to Analytics
          </Link>
        </Button>
      </div>
    </div>
  );
} 
