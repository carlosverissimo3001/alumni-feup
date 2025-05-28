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
  DEFAULT_QUERY_SORT_ORDER,
} from '../consts';
import { sortData } from '../utils';
import { TrendAnalyticsService } from './trend-analytics.service';
import { applyDateFilters } from '../utils/filters';
import { EscoClassificationAnalyticsEntity } from '../entities/esco-classification.entity';

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
    const escoLevel = query.escoClassificationLevel;
    const isDifferentLevel = escoLevel !== 4;

    const allRoles = alumnus
      .flatMap((alumni) => alumni.roles || [])
      .filter((role) => role.jobClassification?.escoClassification);

    const uniqueCodes = new Set<string>();
    if (isDifferentLevel) {
      allRoles.forEach((role) => {
        const code = role.jobClassification!.escoClassification.code.slice(
          0,
          escoLevel,
        );
        uniqueCodes.add(code);
      });
    }

    const hierarchyMap = new Map<string, EscoClassificationAnalyticsEntity>();
    if (uniqueCodes.size > 0) {
      const classifications = await Promise.all(
        Array.from(uniqueCodes).map((code) =>
          this.roleRepository.getClassification(code),
        ),
      );
      classifications.forEach((classification) => {
        if (classification) {
          hierarchyMap.set(classification.code, classification);
        }
      });
    }

    const roleMap = new Map<string, RoleListItemDto>();
    for (const role of allRoles) {
      let { code, titleEn, isLeaf, level } =
        role.jobClassification!.escoClassification;

      if (isDifferentLevel) {
        const shortCode = code.slice(0, escoLevel);
        const hierarchy = hierarchyMap.get(shortCode);
        if (!hierarchy) continue;

        code = hierarchy.code;
        titleEn = hierarchy.titleEn;
        isLeaf = hierarchy.isLeaf;
        level = hierarchy.level;
      }

      const existingRole = roleMap.get(code);
      if (existingRole) {
        existingRole.count++;
      } else {
        roleMap.set(code, {
          name: titleEn,
          code: code,
          isLeaf: isLeaf,
          level: escoLevel || level,
          count: 1,
          trend: [],
        });
      }
    }

    const roles = Array.from(roleMap.values());
    if (query.includeTrend) {
      const trends = await Promise.all(
        roles.map((role) =>
          this.trendAnalyticsService.getRoleTrend({
            data: alumnusUnfiltered,
            entityId: role.code,
            isDifferentClassificationLevel: isDifferentLevel,
          }),
        ),
      );
      roles.forEach((role, index) => {
        role.trend = trends[index];
      });
    }

    const filteredCount = roles.reduce((acc, role) => acc + role.count, 0);

    const rolesOrdered = sortData(roles, {
      sortBy: query.sortBy || DEFAULT_QUERY_SORT_BY,
      direction: query.sortOrder || DEFAULT_QUERY_SORT_ORDER,
    });

    const offset = query.offset || DEFAULT_QUERY_OFFSET;
    const limit = query.limit || DEFAULT_QUERY_LIMIT;
    const rolesPaginated = rolesOrdered.slice(offset, offset + limit);

    return {
      roles: rolesPaginated,
      count: filteredCount,
      distinctCount: roles.length,
    };
  }

  async findAllClassifications(): Promise<RoleOptionDto[]> {
    return this.roleRepository.findAllClassifications();
  }
}
