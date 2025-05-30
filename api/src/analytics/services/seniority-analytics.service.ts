import { Injectable, Logger } from '@nestjs/common';
import { TrendAnalyticsService } from './trend-analytics.service';
import { AlumniAnalyticsRepository } from '../repositories';
import { SeniorityListResponseDto, SeniorityListItemDto } from '../dto';
import { applyDateFilters } from '../utils/filters';
import { QueryParamsDto } from '../dto';
import { SENIORITY_LEVEL } from '@prisma/client';
import { sortData } from '../utils';
import {
  DEFAULT_QUERY_LIMIT,
  DEFAULT_QUERY_OFFSET,
  DEFAULT_QUERY_SORT_BY,
  DEFAULT_QUERY_SORT_ORDER,
} from '../consts';

@Injectable()
export class SeniorityAnalyticsService {
  constructor(
    private readonly alumniRepository: AlumniAnalyticsRepository,
    private readonly trendAnalyticsService: TrendAnalyticsService,
    private readonly logger: Logger,
  ) {}

  async getSeniorityLevels(
    query: QueryParamsDto,
  ): Promise<SeniorityListResponseDto> {
    const alumnusUnfiltered = await this.alumniRepository.find(query);

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

    if (query.includeTrend) {
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
