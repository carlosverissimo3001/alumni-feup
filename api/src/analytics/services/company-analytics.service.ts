import { Injectable } from '@nestjs/common';
import { LogExecutionTime } from '@/decorators/log-execution-time.decorator';
import {
  CompanyListItemExtendedDto,
  CompanyListResponseDto,
  CompanyOptionDto,
  IndustryListItemDto,
  IndustryListResponseDto,
  QueryParamsDto,
  CompanyInsightsDto,
} from '../dto';
import { AlumniAnalyticsEntity } from '../entities/';
import { AlumniAnalyticsRepository, CompanyRepository } from '../repositories';
import {
  DEFAULT_QUERY_LIMIT,
  DEFAULT_QUERY_OFFSET,
  DEFAULT_QUERY_SORT_BY,
  DEFAULT_QUERY_SORT_ORDER,
} from '../consts';
import { sortData } from '../utils';
import { formatYearsToHuman } from '../../utils/format';
import { TrendAnalyticsService } from './trend-analytics.service';
import { applyDateFilters } from '../utils/filters';
import { COMPANY_SIZE, COMPANY_TYPE } from '../consts';
import { differenceInYears } from 'date-fns';

/* Mental note: Try not to use prisma directly in services.
Shouldd use be used in the DAL, ie. repositories.
*/
@Injectable()
export class CompanyAnalyticsService {
  constructor(
    private readonly alumniRepository: AlumniAnalyticsRepository,
    private readonly companyRepository: CompanyRepository,
    private readonly trendAnalyticsService: TrendAnalyticsService,
  ) {}

  /**
   * Given a query, returns a list of companies with the number of alumni they have.
   * @param query - The filters to apply to the DB query
   * @returns A list of companies with the number of alumni they have
   */
  async getCompanyAnalytics(
    alumnusUnfiltered: AlumniAnalyticsEntity[],
    query: QueryParamsDto,
  ): Promise<CompanyListResponseDto> {
    const alumnus = applyDateFilters(alumnusUnfiltered, query);

    const companiesWithAlumniCount = this.getCompanyMap(alumnus);
    const companiesWithAlumniCountOrdered = sortData(companiesWithAlumniCount, {
      sortBy: query.sortBy || DEFAULT_QUERY_SORT_BY,
      direction: query.sortOrder || DEFAULT_QUERY_SORT_ORDER,
    });

    const offset = query.offset || DEFAULT_QUERY_OFFSET;
    const limit = query.limit || DEFAULT_QUERY_LIMIT;
    const companies = companiesWithAlumniCountOrdered.slice(
      offset,
      offset + limit,
    );

    if (query.includeTrend) {
      const trends = await Promise.all(
        companies.map((company) =>
          this.trendAnalyticsService.getCompanyTrend({
            data: alumnusUnfiltered,
            entityId: company.id,
          }),
        ),
      );
      companies.forEach((company, index) => {
        company.trend = trends[index];
      });
    }

    return {
      companies,
      companyCount: companiesWithAlumniCount.length,
      alumniCount: alumnus.length,
    };
  }

  /**
   * Returns a value-label pair of all companies in the database.
   * @returns A list of companies with their id and name
   */
  async getCompanyOptions(): Promise<CompanyOptionDto[]> {
    const companies = await this.companyRepository.findAll();

    return companies.map((company) => ({
      id: company.id,
      name: company.name,
    }));
  }

  /**
   * Returns a list of industries with the number of companies and alumni they have.
   * @param query - The filters to apply to the DB query
   * @returns A list of industries with the number of companies and alumni they have
   */
  async getIndustryWithCounts(
    query: QueryParamsDto,
  ): Promise<IndustryListResponseDto> {
    const alumnusUnfiltered = await this.alumniRepository.find(query);

    const alumnus = applyDateFilters(alumnusUnfiltered, query);
    const companiesWithAlumniCount = this.getCompanyMap(alumnus);

    const industriesMap = new Map<string, { name: string; count: number }>();
    for (const company of companiesWithAlumniCount) {
      const industryId = company.industryId;
      if (!industryId) continue;

      const industryData = industriesMap.get(industryId) || {
        name: company.industry,
        count: 0,
      };
      industryData.count += company.count;
      industriesMap.set(industryId, industryData);
    }

    const industries: IndustryListItemDto[] = Array.from(
      industriesMap.entries(),
    ).map(([industryId, data]) => ({
      id: industryId,
      name: data.name,
      count: data.count,
      trend: [],
    }));

    if (query.includeTrend) {
      const trends = await Promise.all(
        industries.map((industry) =>
          this.trendAnalyticsService.getIndustryTrend({
            data: alumnusUnfiltered,
            entityId: industry.id,
          }),
        ),
      );
      industries.forEach((industry, index) => {
        industry.trend = trends[index];
      });
    }

    const industriesOrdered = sortData(industries, {
      sortBy: query.sortBy || DEFAULT_QUERY_SORT_BY,
      direction: query.sortOrder || DEFAULT_QUERY_SORT_ORDER,
    });

    const offset = query.offset || DEFAULT_QUERY_OFFSET;
    const limit = query.limit || DEFAULT_QUERY_LIMIT;
    const industriesPaginated = industriesOrdered.slice(offset, offset + limit);

    return {
      industries: industriesPaginated,
      count: industries.length,
    };
  }

  async getCompanyInsights(id: string): Promise<CompanyInsightsDto> {
    const [company, alumnus] = await Promise.all([
      this.companyRepository.findById(id),
      this.alumniRepository.find({ companyIds: [id] }),
    ]);

    const roles = alumnus.flatMap((a) => a.roles);
    if (roles.length === 0) {
      return {
        id,
        name: company.name,
        logo: company.logo,
        linkedinUrl: company.linkedinUrl,
        levelsFyiUrl: company.levelsFyiUrl,
        foundedByAlumni: false,
        companySize: company.companySize
          ? COMPANY_SIZE[company.companySize]
          : undefined,
        companyType: company.companyType
          ? COMPANY_TYPE[company.companyType]
          : undefined,
        founded: company.founded,
        website: company.website,
        headquarters: company.location,
        industry: company.industry,
        similarCompanies: [],
        averageYOE: 0,
        averageYOC: formatYearsToHuman(0),
        roles: [],
        currentAlumni: [],
        alumni: [],
        countries: [],
        cities: [],
        alumniTrend: [],
        averageTrend: [],
        industryTrend: [],
        migrations: [],
      };
    }

    const yearsInCompany =
      roles
        .map((role) => {
          const startDate = new Date(role.startDate);
          const endDate = role.endDate ? new Date(role.endDate) : new Date();
          return endDate.getFullYear() - startDate.getFullYear();
        })
        .reduce((acc, curr) => acc + curr, 0) / roles.length;

    const currentAlumniIds = new Set(
      roles.filter((role) => role.isCurrent).map((role) => role.alumniId),
    );

    const yoes = await Promise.all(
      Array.from(currentAlumniIds).map(async (alumniId) => {
        const oldestRole =
          await this.alumniRepository.findOldestAlumniRole(alumniId);
        return oldestRole
          ? differenceInYears(new Date(), new Date(oldestRole.startDate))
          : 0;
      }),
    );

    const yoe =
      yoes.length > 0
        ? Math.round(yoes.reduce((acc, curr) => acc + curr, 0) / yoes.length)
        : 0;

    return {
      id,
      name: company.name,
      logo: company.logo,
      linkedinUrl: company.linkedinUrl,
      levelsFyiUrl: company.levelsFyiUrl,
      foundedByAlumni: false,
      companySize: company.companySize
        ? COMPANY_SIZE[company.companySize]
        : undefined,
      companyType: company.companyType
        ? COMPANY_TYPE[company.companyType]
        : undefined,
      founded: company.founded,
      website: company.website,
      headquarters: company.location,
      industry: company.industry,
      similarCompanies: [],
      averageYOE: yoe,
      averageYOC: formatYearsToHuman(yearsInCompany),
      roles: [],
      currentAlumni: [],
      alumni: [],
      countries: [],
      cities: [],
      alumniTrend: [],
      averageTrend: [],
      industryTrend: [],
      migrations: [],
    };
  }

  /**
   * Maps an alumni to a set of companies they've worked at.
   * @param alumnus - The alumni to map
   * @returns A list of companies with the number of alumni they have
   */
  getCompanyMap(
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

  /**
   * Get detailed information about a specific company
   */
  async getCompanyDetails(id: string): Promise<any> {
    // Implementation will be added Ina future PR
    return Promise.resolve({ id });
  }
}
