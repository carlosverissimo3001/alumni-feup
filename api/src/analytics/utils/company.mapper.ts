import { CompanyAnalyticsEntity } from '../entities/company.entity';

type RawCompany = {
  id: string;
  name: string;
  logo: string | null;
  Industry: {
    id: string;
    name: string;
  };
  Role: { id: string; alumniId: string }[];
};

export function toCompanyAnalyticsEntity(
  company: RawCompany,
): CompanyAnalyticsEntity {
  return {
    id: company.id,
    name: company.name,
    logo: company.logo,
    industry: {
      id: company.Industry.id,
      name: company.Industry.name,
    },
    roles: company.Role.map((r) => ({ id: r.id, alumniId: r.alumniId })),
  };
}
