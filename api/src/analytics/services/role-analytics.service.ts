import {
  RoleListResponseDto,
  QueryParamsDto,
  RoleOptionDto,
  RoleListItemDto,
} from '@/analytics/dto';
import {
  AlumniAnalyticsRepository,
  RoleRepository,
} from '@/analytics/repositories';
import { Injectable } from '@nestjs/common';
import {
  DEFAULT_QUERY_LIMIT,
  DEFAULT_QUERY_OFFSET,
  DEFAULT_QUERY_SORT_BY,
} from '../utils/consts';
import { DEFAULT_QUERY_SORT_ORDER } from '../utils/consts';
import { sortData } from '../utils';
import { TrendAnalyticsService } from './trend-analytics.service';
import { applyDateFilters } from '../utils/filters';
@Injectable()
export class RoleAnalyticsService {
  constructor(
    private readonly alumniRepository: AlumniAnalyticsRepository,
    private readonly roleRepository: RoleRepository,
    private readonly trendAnalyticsService: TrendAnalyticsService,
  ) {}

  async getRolesWithCounts(
    query: QueryParamsDto,
  ): Promise<RoleListResponseDto> {
    const alumnusUnfiltered = await this.alumniRepository.find(query);
    const alumnus = applyDateFilters(alumnusUnfiltered, query);

    const roleMap = new Map<string, RoleListItemDto>();
    const escoLevel = query.escoClassificationLevel;

    alumnus
      .flatMap((alumni) => alumni.roles || [])
      .filter((role) => role.jobClassification)
      .forEach((role) => {
        const jobClassification = role.jobClassification;

        // We filtered above, this is to make the linter happy
        if (!jobClassification) {
          return;
        }

        const escoClassification = jobClassification.escoClassification;

        const { code, titleEn, isLeaf, level } = escoClassification;

        if (roleMap.has(code)) {
          roleMap.get(code)!.count++;
        } else {
          roleMap.set(code, {
            name: titleEn,
            code: code,
            isLeaf: isLeaf,
            level: escoLevel || level,
            count: 1,
            trend: query.includeTrend
              ? this.trendAnalyticsService.getRoleTrend({
                  data: alumnusUnfiltered,
                  entityId: code,
                })
              : [],
          });
        }
      });

    const roles = Array.from(roleMap.values());

    // Fitered count
    const filteredCount = roles.reduce((acc, role) => acc + role.count, 0);

    // Total count
    const count = await this.roleRepository.count();

    const rolesOrdered = sortData(roles, {
      sortBy: query.sortBy || DEFAULT_QUERY_SORT_BY,
      direction: query.sortOrder || DEFAULT_QUERY_SORT_ORDER,
    });

    const rolesPaginated = rolesOrdered.slice(
      query.offset || DEFAULT_QUERY_OFFSET,
      (query.offset || DEFAULT_QUERY_OFFSET) +
        (query.limit || DEFAULT_QUERY_LIMIT),
    );

    return {
      roles: rolesPaginated,
      count,
      filteredCount,
      distinctCount: roles.length,
    };
  }

  async findAllClassifications(): Promise<RoleOptionDto[]> {
    return this.roleRepository.findAllClassifications();
  }
}
