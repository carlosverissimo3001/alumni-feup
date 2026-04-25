import { Injectable } from '@nestjs/common';
import { SENIORITY_LEVEL } from '@prisma/client';
import {
  DEFAULT_QUERY_LIMIT,
  DEFAULT_QUERY_OFFSET,
  DEFAULT_QUERY_SORT_BY,
  DEFAULT_QUERY_SORT_ORDER,
} from '../consts';
import {
  QueryParamsDto,
  SeniorityListItemDto,
  SeniorityListResponseDto,
} from '../dto';
import { AlumniAnalyticsEntity } from '../entities';
import { AlumniAnalyticsRepository } from '../repositories';
import { sortData } from '../utils';
import { applyDateFilters } from '../utils/filters';
import { TrendAnalyticsService } from './trend-analytics.service';

@Injectable()
export class SeniorityAnalyticsService {
  constructor(
    private readonly trendAnalyticsService: TrendAnalyticsService,
    private readonly alumniRepository: AlumniAnalyticsRepository,
  ) {}

  async getSeniorityAnalytics(
    alumnusUnfiltered: AlumniAnalyticsEntity[], // Keep for signature compatibility for now
    query: QueryParamsDto,
  ): Promise<SeniorityListResponseDto> {
    const seniorityCounts = await this.alumniRepository.getSeniorityCounts(query);

    const seniorityLevels: SeniorityListItemDto[] = seniorityCounts.map((res) => ({
      name: res.seniorityLevel,
      count: res._count._all,
      trend: [],
    }));

    if (query.includeSeniorityTrend) {
      const trends = await Promise.all(
        seniorityLevels.map((level) =>
          this.trendAnalyticsService.getSeniorityTrend({
            entityId: level.name,
            query,
          }),
        ),
      );
      seniorityLevels.forEach((level, index) => {
        level.trend = trends[index];
      });
    }

    const seniorityLevelsOrdered = sortData(seniorityLevels, {
      sortBy: query.sortBy || DEFAULT_QUERY_SORT_BY,
      direction: query.sortOrder || DEFAULT_QUERY_SORT_ORDER,
    });

    const offset = query.offset || DEFAULT_QUERY_OFFSET;
    const limit = query.limit || DEFAULT_QUERY_LIMIT;
    const seniorityLevelsPaginated = seniorityLevelsOrdered.slice(
      offset,
      offset + limit,
    );

    return {
      seniorityLevels: seniorityLevelsPaginated,
      count: seniorityLevels.length,
    };
  }
}
