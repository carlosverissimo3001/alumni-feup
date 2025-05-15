import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface BasicCompany {
  id: string;
  name: string;
  logo?: string;
}

interface SimilarCompaniesProps {
  companies?: BasicCompany[] | null;
}

export default function SimilarCompanies({ companies }: SimilarCompaniesProps) {
  if (!companies || companies.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Similar Companies</CardTitle>
        </CardHeader>
        <CardContent className="flex h-32 items-center justify-center">
          <p className="text-muted-foreground">No similar companies found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Similar Companies</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {companies.map(company => (
            <Link 
              href={`/company/${company.id}`} 
              key={company.id} 
              className="flex items-center gap-3 p-3 rounded-md hover:bg-muted transition-colors group"
            >
              <Avatar className="h-10 w-10 border border-border">
                <AvatarImage src={company.logo || ''} alt={company.name} />
                <AvatarFallback className="text-xs font-semibold">
                  {company.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="truncate">
                <p className="font-medium truncate group-hover:text-primary transition-colors">
                  {company.name}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 
