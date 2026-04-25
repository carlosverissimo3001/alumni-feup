import { Injectable } from '@nestjs/common';
import {
  DEFAULT_QUERY_LIMIT,
  DEFAULT_QUERY_OFFSET,
  DEFAULT_QUERY_SORT_BY,
  DEFAULT_QUERY_SORT_ORDER,
} from '../consts';
import {
  AlumniListItemDto,
  CompanyListItemExtendedDto,
  IndustryListItemDto,
  IndustryListResponseDto,
  IndustryOptionDto,
  QueryParamsDto,
} from '../dto';
import { AlumniAnalyticsEntity } from '../entities';
import { AlumniAnalyticsRepository, IndustryRepository } from '../repositories';
import { applyDateFilters, getCompanyMap, sortData } from '../utils';
import { TrendAnalyticsService } from './trend-analytics.service';

@Injectable()
export class IndustryAnalyticsService {
  constructor(
    private readonly industryRepository: IndustryRepository,
    private readonly trendAnalyticsService: TrendAnalyticsService,
    private readonly alumniRepository: AlumniAnalyticsRepository,
  ) {}

  /**
   * Returns a list of industries with the number of companies and alumni they have.
   * @param query - The filters to apply to the DB query
   * @returns A list of industries with the number of companies and alumni they have
   */
  async getIndustryAnalytics(
    alumnusUnfiltered: AlumniAnalyticsEntity[],
    query: QueryParamsDto,
  ): Promise<IndustryListResponseDto> {
    const companyAggregates = await this.alumniRepository.getCompanyAggregates(
      query,
    );

    const industriesMap = new Map<string, { name: string; count: number }>();
    for (const company of companyAggregates) {
      const industryId = company.industryId;
      if (!industryId) continue;

      const industryData = industriesMap.get(industryId) || {
        name: company.Industry.name,
        count: 0,
      };
      industryData.count += company._count.roles;
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

  async getIndustryOptions(): Promise<IndustryOptionDto[]> {
    const industries = await this.industryRepository.findAll();

    return industries.map((industry) => ({
      id: industry.id,
      name: industry.name,
    }));
  }
}
