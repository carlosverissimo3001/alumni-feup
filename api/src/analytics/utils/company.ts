import { CompanyListItemExtendedDto } from '../dto';
import { AlumniAnalyticsEntity } from '../entities';

/**
 * Maps an alumni to a set of companies they've worked at.
 * @param alumnus - The alumni to map
 * @returns A list of companies with the number of alumni they have
 */
export function getCompanyMap(
  alumnus: AlumniAnalyticsEntity[],
): CompanyListItemExtendedDto[] {
  const companyMap = new Map<
    string,
    {
      count: number;
      name: string;
      logo: string | undefined;
      industry: string;
      industryId: string;
      levelsFyiUrl: string | undefined;
    }
  >();

  for (const alumni of alumnus) {
    const seenCompanies = new Set<string>();

    for (const role of alumni.roles) {
      const companyId = role.company.id;

      if (!seenCompanies.has(companyId)) {
        seenCompanies.add(companyId);

        const existingCompany = companyMap.get(companyId);
        if (existingCompany) {
          existingCompany.count++;
        } else {
          companyMap.set(companyId, {
            count: 1,
            name: role.company.name,
            logo: role.company.logo,
            industry: role.company.industry.name,
            industryId: role.company.industry.id,
            levelsFyiUrl: role.company.levelsFyiUrl,
          });
        }
      }
    }
  }

  return Array.from(companyMap.entries()).map(([id, data]) => ({
    id,
    name: data.name,
    count: data.count,
    logo: data.logo,
    industry: data.industry,
    industryId: data.industryId,
    levelsFyiUrl: data.levelsFyiUrl,
    trend: [],
  }));
}
