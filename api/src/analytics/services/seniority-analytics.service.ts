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
import { sortData } from '../utils';
import { applyDateFilters } from '../utils/filters';
import { TrendAnalyticsService } from './trend-analytics.service';

@Injectable()
export class SeniorityAnalyticsService {
  constructor(private readonly trendAnalyticsService: TrendAnalyticsService) {}

  async getSeniorityAnalytics(
    alumnusUnfiltered: AlumniAnalyticsEntity[],
    query: QueryParamsDto,
  ): Promise<SeniorityListResponseDto> {
    const alumnus = applyDateFilters(alumnusUnfiltered, query);

    const allSeniorityLevels = alumnus
      .flatMap((alumni) => alumni.roles || [])
      .filter((role) => role.seniorityLevel);

    const uniqueSeniorityLevels = new Map<SENIORITY_LEVEL, number>();
    for (const role of allSeniorityLevels) {
      uniqueSeniorityLevels.set(
        role.seniorityLevel,
        (uniqueSeniorityLevels.get(role.seniorityLevel) || 0) + 1,
      );
    }

    const seniorityLevels: SeniorityListItemDto[] = Array.from(
      uniqueSeniorityLevels.entries(),
    ).map(([seniorityLevel, count]) => ({
      name: seniorityLevel,
      count,
      trend: [],
    }));

    if (query.includeSeniorityTrend) {
      const trends = await Promise.all(
        seniorityLevels.map((level) =>
          this.trendAnalyticsService.getSeniorityTrend({
            data: alumnusUnfiltered,
            entityId: level.name,
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
      count: uniqueSeniorityLevels.size,
    };
  }
}
