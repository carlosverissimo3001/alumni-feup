import { AlumniAnalyticsEntity, LocationAnalyticsEntity } from '../entities';

type RawLocation = {
  id: string;
  country?: string | null;
  countryCode?: string | null;
  city?: string | null;
};

type RawRole = {
  id: string;
  alumniId: string;
  Location?: RawLocation | null;
  Company: {
    id: string;
    name: string;
    logo?: string | null;
    Industry: {
      id: string;
      name: string;
    };
    Location?: RawLocation | null;
  };
};

type RawAlumni = {
  id: string;
  Roles: RawRole[];
};

export function toAlumniAnalyticsEntity(
  alumni: RawAlumni,
): AlumniAnalyticsEntity {
  return {
    id: alumni.id,
    roles: alumni.Roles.map((role) => ({
      id: role.id,
      alumniId: role.alumniId,
      company: {
        id: role.Company.id,
        name: role.Company.name,
        logo: role.Company.logo,
        industry: {
          id: role.Company.Industry.id,
          name: role.Company.Industry.name,
        },
        location: mapLocation(role.Company.Location),
      },
      location: mapLocation(role.Location),
    })),
  };
}

const mapLocation = (
  location?: RawLocation | null,
): LocationAnalyticsEntity | null => {
  if (!location) return null;
  return {
    id: location.id,
    country: location.country ?? '',
    countryCode: location.countryCode ?? '',
    city: location.city ?? '',
  };
};
