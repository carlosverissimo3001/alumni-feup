import { MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

interface GeoData {
  id: string;
  name?: string;
  city?: string;
  country?: string;
  count?: number;
}

interface GeographicDistributionProps {
  countries?: GeoData[] | null;
  cities?: GeoData[] | null;
}

export default function GeographicDistribution({ countries, cities }: GeographicDistributionProps) {
  const hasCountries = countries && countries.length > 0;
  const hasCities = cities && cities.length > 0;
  
  if (!hasCountries && !hasCities) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Geographic Distribution</CardTitle>
        </CardHeader>
        <CardContent className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">No geographic data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Geographic Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={hasCountries ? "countries" : "cities"}>
          <TabsList className="mb-4">
            {hasCountries && <TabsTrigger value="countries">Countries</TabsTrigger>}
            {hasCities && <TabsTrigger value="cities">Cities</TabsTrigger>}
          </TabsList>
          
          {hasCountries && (
            <TabsContent value="countries">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {countries!.sort((a, b) => (b.count || 0) - (a.count || 0)).map((country) => (
                  <div 
                    key={country.id} 
                    className="flex items-center gap-2 p-3 rounded-md border border-border"
                  >
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium">{country.name || country.country}</p>
                    </div>
                    {country.count && (
                      <span className="text-sm font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        {country.count}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>
          )}
          
          {hasCities && (
            <TabsContent value="cities">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cities!.sort((a, b) => (b.count || 0) - (a.count || 0)).map((city) => (
                  <div 
                    key={city.id} 
                    className="flex items-center gap-2 p-3 rounded-md border border-border"
                  >
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium">{city.city || city.name}</p>
                      <p className="text-xs text-muted-foreground">{city.country}</p>
                    </div>
                    {city.count && (
                      <span className="text-sm font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        {city.count}
                      </span>
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
