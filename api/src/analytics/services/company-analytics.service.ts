import { Injectable } from '@nestjs/common';
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
  sortData,
  DEFAULT_QUERY_LIMIT,
  DEFAULT_QUERY_OFFSET,
  DEFAULT_QUERY_SORT_BY,
  DEFAULT_QUERY_SORT_ORDER,
} from '../utils/';
import { formatYearsToHuman } from '../../utils/format';
import { TrendAnalyticsService } from './trend-analytics.service';
import { applyDateFilters } from '../utils/filters';
import { COMPANY_SIZE, COMPANY_TYPE } from '@/consts';
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
  async getCompaniesWithAlumniCount(
    query: QueryParamsDto,
  ): Promise<CompanyListResponseDto> {
    // I know, it's really ugly, but I need the unfiltered data to get the trend
    // As it is always fixed to the last 15 years
    const alumnusUnfiltered = await this.alumniRepository.find(query);

    // This contains the actual data
    const alumnus = applyDateFilters(alumnusUnfiltered, query);

    const companiesWithAlumniCount = this.getCompanyMap(alumnus);

    // Count without filters
    const companyCount = await this.companyRepository.count();
    const alumniCount = await this.alumniRepository.countAlumni();

    // Count with filters
    const alumniFilteredCount = alumnus.length;
    const companyFilteredCount = companiesWithAlumniCount.length;

    const companiesWithAlumniCountOrdered = sortData(companiesWithAlumniCount, {
      sortBy: query.sortBy || DEFAULT_QUERY_SORT_BY,
      direction: query.sortOrder || DEFAULT_QUERY_SORT_ORDER,
    });

    const companies = companiesWithAlumniCountOrdered.slice(
      query.offset || DEFAULT_QUERY_OFFSET,
      (query.offset || DEFAULT_QUERY_OFFSET) +
        (query.limit || DEFAULT_QUERY_LIMIT),
    );

    // Trend data
    companies.map((company) => {
      company.trend = query.includeTrend
        ? this.trendAnalyticsService.getCompanyTrend({
            data: alumnusUnfiltered,
            entityId: company.id,
          })
        : [];
    });

    return {
      companies,
      companyCount,
      companyFilteredCount,
      alumniCount,
      alumniFilteredCount,
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
    const industriesMap = new Map<string, { name: string; count: number }>();

    const alumnusUnfiltered = await this.alumniRepository.find(query);
    const alumnus = applyDateFilters(alumnusUnfiltered, query);
    const companiesWithAlumniCount = this.getCompanyMap(alumnus);

    // Total Industries, regardless of filters
    const totalIndustries = await this.companyRepository.countIndustries();

    companiesWithAlumniCount.forEach((company) => {
      const industryId = company.industryId;

      if (industryId && !industriesMap.has(industryId)) {
        industriesMap.set(industryId, {
          name: company.industry,
          count: 0,
        });
      }

      const industryData = industriesMap.get(industryId)!; // We just made sure it exists above, so we're gucci

      industryData.count += company.count;
    });

    const industries: IndustryListItemDto[] = Array.from(
      industriesMap.entries(),
    ).map(([industryId, data]) => {
      return {
        id: industryId,
        name: data.name,
        count: data.count,
        trend: query.includeTrend
          ? this.trendAnalyticsService.getIndustryTrend({
              data: alumnusUnfiltered,
              entityId: industryId,
            })
          : [],
      };
    });

    const industriesOrdered = sortData(industries, {
      sortBy: query.sortBy || DEFAULT_QUERY_SORT_BY,
      direction: query.sortOrder || DEFAULT_QUERY_SORT_ORDER,
    });

    const industriesPaginated = industriesOrdered.slice(
      query.offset || DEFAULT_QUERY_OFFSET,
      (query.offset || DEFAULT_QUERY_OFFSET) +
        (query.limit || DEFAULT_QUERY_LIMIT),
    );

    return {
      industries: industriesPaginated,
      count: totalIndustries,
      filteredCount: industries.length,
    };
  }

  async getCompanyInsights(id: string): Promise<CompanyInsightsDto> {
    const alumnus = await this.alumniRepository.find({
      companyIds: [id],
    });

    const company = await this.companyRepository.findById(id);
    const roles = alumnus.flatMap((alumnus) => alumnus.roles);

    // Years in Company, regardless of end date
    const yearsInCompany =
      roles
        .map((role) => {
          const startDate = new Date(role.startDate);
          const endDate = role.endDate ? new Date(role.endDate) : new Date();
          const years = endDate.getFullYear() - startDate.getFullYear();
          return years;
        })
        .reduce((acc, curr) => acc + curr, 0) / roles.length;

    const companyAlumni = [
      ...new Set(
        roles.filter((role) => role.isCurrent).map((role) => role.alumniId),
      ),
    ];

    const yoes = await Promise.all(
      companyAlumni.map(async (alumniId) => {
        const oldestRole =
          await this.alumniRepository.findOldestAlumniRole(alumniId);
        if (!oldestRole) return 0;

        return differenceInYears(new Date(), new Date(oldestRole.startDate));
      }),
    );

    const yoe = Math.round(
      yoes.reduce((acc, curr) => acc + curr, 0) / yoes.length,
    );

    return {
      id,
      name: company.name,
      logo: company.logo,
      linkedinUrl: company.linkedinUrl,
      levelsFyiUrl: company.levelsFyiUrl,
      foundedByAlumni: false,
      companySize: company.companySize
        ? COMPANY_SIZE[company.companySize]
        : null,
      companyType: company.companyType
        ? COMPANY_TYPE[company.companyType]
        : null,
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
    // Maps an alumni to a set of companies they've worked at
    const alumniCompanyMap = new Map<string, Set<string>>();
    const companiesWithAlumniCount: CompanyListItemExtendedDto[] = [];

    alumnus.forEach((alumnus) => {
      if (!alumniCompanyMap.has(alumnus.id)) {
        alumniCompanyMap.set(alumnus.id, new Set());
      }

      alumnus.roles.forEach((role) => {
        alumniCompanyMap.get(alumnus.id)!.add(role.company.id);
      });
    });

    const companyCountMap = new Map<string, number>();
    alumniCompanyMap.forEach((companySet) => {
      companySet.forEach((companyId) => {
        companyCountMap.set(
          companyId,
          (companyCountMap.get(companyId) || 0) + 1,
        );
      });
    });

    companyCountMap.forEach((count, companyId) => {
      const role = alumnus
        .flatMap((a) => a.roles)
        .find((r) => r.company.id === companyId);

      if (role) {
        companiesWithAlumniCount.push({
          id: companyId,
          name: role.company.name,
          count: count,
          logo: role.company.logo,
          industry: role.company.industry.name,
          industryId: role.company.industry.id,
          levelsFyiUrl: role.company.levelsFyiUrl,
          trend: [],
        });
      }
    });

    return companiesWithAlumniCount;
  }

  /**
   * Get detailed information about a specific company
   */
  async getCompanyDetails(id: string): Promise<any> {
    // Implementation will be added Ina future PR
    return Promise.resolve({ id });
  }
}
