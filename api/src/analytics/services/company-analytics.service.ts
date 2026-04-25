import { Injectable } from '@nestjs/common';
import { differenceInYears } from 'date-fns';
import { formatYearsToHuman } from '../../utils/format';
import {
  COMPANY_SIZE,
  COMPANY_TYPE,
  DEFAULT_QUERY_LIMIT,
  DEFAULT_QUERY_OFFSET,
  DEFAULT_QUERY_SORT_BY,
  DEFAULT_QUERY_SORT_ORDER,
} from '../consts';
import {
  CompanyInsightsDto,
  CompanyListItemExtendedDto,
  CompanyListResponseDto,
  CompanyOptionDto,
  IndustryListItemDto,
  IndustryListResponseDto,
  QueryParamsDto,
} from '../dto';
import { AlumniAnalyticsEntity } from '../entities/';
import { AlumniAnalyticsRepository, CompanyRepository } from '../repositories';
import { getCompanyMap, sortData } from '../utils';
import { applyDateFilters } from '../utils/filters';
import { TrendAnalyticsService } from './trend-analytics.service';

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
    const companyAggregates = await this.alumniRepository.getCompanyAggregates(
      query,
    );

    const companies: CompanyListItemExtendedDto[] = companyAggregates.map(
      (company) => ({
        id: company.id,
        name: company.name,
        count: company._count.roles,
        logo: company.logo ?? undefined,
        industry: company.Industry.name,
        industryId: company.industryId,
        levelsFyiUrl: company.levelsFyiUrl ?? undefined,
        trend: [],
      }),
    );

    const companiesWithAlumniCountOrdered = sortData(companies, {
      sortBy: query.sortBy || DEFAULT_QUERY_SORT_BY,
      direction: query.sortOrder || DEFAULT_QUERY_SORT_ORDER,
    });

    const offset = query.offset || DEFAULT_QUERY_OFFSET;
    const limit = query.limit || DEFAULT_QUERY_LIMIT;
    const companiesPaginated = companiesWithAlumniCountOrdered.slice(
      offset,
      offset + limit,
    );

    if (query.includeCompanyTrend) {
      const trends = await Promise.all(
        companiesPaginated.map((company) =>
          this.trendAnalyticsService.getCompanyTrend({
            entityId: company.id,
            query,
          }),
        ),
      );
      companiesPaginated.forEach((company, index) => {
        company.trend = trends[index];
      });
    }

    return {
      companies: companiesPaginated,
      companyCount: companies.length,
      alumniCount: await this.alumniRepository.countAlumni(query),
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
  async getIndustryAnalytics(
    alumnusUnfiltered: AlumniAnalyticsEntity[],
    query: QueryParamsDto,
  ): Promise<IndustryListResponseDto> {
    const alumnus = applyDateFilters(alumnusUnfiltered, query);
    const companiesWithAlumniCount = getCompanyMap(alumnus);

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

    if (query.includeIndustryTrend) {
      const trends = await Promise.all(
        industries.map((industry) =>
          this.trendAnalyticsService.getIndustryTrend({
            entityId: industry.id,
            query,
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

  /**
   * Given a company id, returns insights about the company
   * @param id - The id of the company
   * @returns Insights about the company such as average YOE, average YOC, etc.
   */
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

    const oldestRoles = await this.alumniRepository.findOldestRolesStartDates(
      Array.from(currentAlumniIds),
    );

    const yoes = oldestRoles.map((role) =>
      role.startDate
        ? differenceInYears(new Date(), new Date(role.startDate))
        : 0,
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
   * Get detailed information about a specific company
   */
  async getCompanyDetails(id: string): Promise<any> {
    // Implementation will be added Ina future PR
    return Promise.resolve({ id });
  }
}
