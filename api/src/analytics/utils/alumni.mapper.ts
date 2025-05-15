import {
  AlumniAnalyticsEntity,
  CompanyAnalyticsEntity,
  IndustryAnalyticsEntity,
  JobClassificationAnalyticsEntity,
  LocationAnalyticsEntity,
  RoleAnalyticsEntity,
} from '../entities';

type RawJobClassification = {
  title: string;
  escoCode: string;
  level: number;
  confidence?: number | null;
};

type RawLocation = {
  id: string;
  country?: string | null;
  countryCode?: string | null;
  city?: string | null;
};

type RawRole = {
  id: string;
  alumniId: string;
  isCurrent: boolean;
  startDate: Date;
  endDate?: Date | null;
  Location?: RawLocation | null;
  JobClassification?: RawJobClassification | null;
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

type RawCompany = {
  id: string;
  name: string;
  logo?: string | null;
  Industry: RawIndustry;
  Location?: RawLocation | null;
};

type RawIndustry = {
  id: string;
  name: string;
};

export function toAlumniAnalyticsEntity(
  alumni: RawAlumni,
): AlumniAnalyticsEntity {
  return {
    id: alumni.id,
    roles: alumni.Roles.map(mapRole),
  };
}

export function toRoleAnalyticsEntity(
  role: Pick<RawRole, 'id' | 'startDate' | 'endDate' | 'alumniId'>,
): Partial<RoleAnalyticsEntity> {
  return {
    id: role.id,
    startDate: role.startDate,
    endDate: role.endDate,
    alumniId: role.alumniId,
  };
}

const mapCompany = (company: RawCompany): CompanyAnalyticsEntity => {
  return {
    id: company.id,
    name: company.name,
    logo: company.logo,
    industry: mapIndustry(company.Industry),
    location: mapLocation(company.Location),
  };
};

const mapIndustry = (industry: RawIndustry): IndustryAnalyticsEntity => {
  return {
    id: industry.id,
    name: industry.name,
  };
};

const mapJobClassification = (
  jobClassification?: RawJobClassification | null,
): JobClassificationAnalyticsEntity | null => {
  if (!jobClassification) return null;
  return {
    escoCode: jobClassification.escoCode,
    name: jobClassification.title,
    level: jobClassification.level,
    confidence: jobClassification.confidence,
  };
};
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

const mapRole = (role: RawRole): RoleAnalyticsEntity => {
  return {
    id: role.id,
    alumniId: role.alumniId,
    startDate: role.startDate,
    endDate: role.endDate,
    isCurrent: role.isCurrent,
    jobClassification: mapJobClassification(role.JobClassification),
    company: mapCompany(role.Company),
    location: mapLocation(role.Location),
  };
};

// Need to map the graduations next
