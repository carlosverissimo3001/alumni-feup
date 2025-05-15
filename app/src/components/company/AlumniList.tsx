import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import Link from 'next/link';

interface Alumni {
  id: string;
  name: string;
  role?: string;
  avatar?: string;
  linkedinUrl?: string;
  company?: {
    id: string;
    name: string;
  };
}

interface AlumniListProps {
  currentAlumni?: Alumni[] | null;
  pastAlumni?: Alumni[] | null;
  title?: string;
}

export default function AlumniList({ 
  currentAlumni, 
  pastAlumni, 
  title = "Alumni"
}: AlumniListProps) {
  const hasCurrentAlumni = currentAlumni && currentAlumni.length > 0;
  const hasPastAlumni = pastAlumni && pastAlumni.length > 0;
  
  if (!hasCurrentAlumni && !hasPastAlumni) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">No alumni data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={hasCurrentAlumni ? "current" : "past"}>
          <TabsList className="mb-4">
            {hasCurrentAlumni && (
              <TabsTrigger value="current">Current Alumni</TabsTrigger>
            )}
            {hasPastAlumni && (
              <TabsTrigger value="past">Past Alumni</TabsTrigger>
            )}
          </TabsList>
          
          {hasCurrentAlumni && (
            <TabsContent value="current">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentAlumni!.map(alumni => (
                  <div 
                    key={alumni.id} 
                    className="flex items-center gap-3 p-3 rounded-md border border-border"
                  >
                    <Avatar className="h-10 w-10 border border-border">
                      <AvatarImage src={alumni.avatar || ''} alt={alumni.name} />
                      <AvatarFallback>
                        {alumni.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{alumni.name}</p>
                      {alumni.role && (
                        <p className="text-xs text-muted-foreground truncate">{alumni.role}</p>
                      )}
                    </div>
                    {alumni.linkedinUrl && (
                      <Link 
                        href={alumni.linkedinUrl} 
                        target="_blank"
                        className="text-sm text-primary hover:underline"
                      >
                        Profile
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>
          )}
          
          {hasPastAlumni && (
            <TabsContent value="past">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pastAlumni!.map(alumni => (
                  <div 
                    key={alumni.id} 
                    className="flex items-center gap-3 p-3 rounded-md border border-border"
                  >
                    <Avatar className="h-10 w-10 border border-border">
                      <AvatarImage src={alumni.avatar || ''} alt={alumni.name} />
                      <AvatarFallback>
                        {alumni.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{alumni.name}</p>
                      {alumni.company ? (
                        <Link 
                          href={`/company/${alumni.company.id}`}
                          className="text-xs text-primary hover:underline truncate block"
                        >
                          {alumni.company.name}
                        </Link>
                      ) : alumni.role ? (
                        <p className="text-xs text-muted-foreground truncate">{alumni.role}</p>
                      ) : null}
                    </div>
                    {alumni.linkedinUrl && (
                      <Link 
                        href={alumni.linkedinUrl} 
                        target="_blank"
                        className="text-sm text-primary hover:underline"
                      >
                        Profile
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
} 
