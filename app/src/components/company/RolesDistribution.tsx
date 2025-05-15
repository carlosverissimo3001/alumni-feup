import { Briefcase } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface Role {
  id: string;
  name: string;
  count?: number;
}

interface RolesDistributionProps {
  roles?: Role[] | null;
}

export default function RolesDistribution({ roles }: RolesDistributionProps) {
  if (!roles || roles.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Role Distribution</CardTitle>
        </CardHeader>
        <CardContent className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">No role data available</p>
        </CardContent>
      </Card>
    );
  }

  // Sort roles by count in descending order
  const sortedRoles = [...roles].sort((a, b) => (b.count || 0) - (a.count || 0));

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Role Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedRoles.map(role => (
            <div 
              key={role.id} 
              className="flex items-center gap-2 p-3 rounded-md border border-border"
            >
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-medium">{role.name}</p>
              </div>
              {role.count && (
                <span className="text-sm font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  {role.count}
                </span>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 
