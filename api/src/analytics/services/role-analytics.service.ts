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

    const roleMap = new Map<string, RoleListItemDto>();
    const escoLevel = query.escoClassificationLevel;

    // Keeps a map of the hierarchy of the esco classifications
    const isDifferentLevel = escoLevel && escoLevel !== 4;
    const hierarchyMap = new Map<string, EscoClassificationAnalyticsEntity>();

    const allRoles = alumnus.flatMap((alumni) => alumni.roles || []);
    for (const role of allRoles) {
      if (!role.jobClassification) continue;

      const jobClassification = role.jobClassification;
      const escoClassification = jobClassification.escoClassification;

      let code = escoClassification.code;
      let titleEn = escoClassification.titleEn;
      let isLeaf = escoClassification.isLeaf;
      let level = escoClassification.level;

      if (isDifferentLevel) {
        code = code.slice(0, escoLevel);
        // First, let's see if we already have the hierarchy
        const hierarchy = hierarchyMap.get(code);
        if (!hierarchy) {
          const newHierarchy =
            await this.roleRepository.getClassification(code);
          if (newHierarchy) {
            hierarchyMap.set(code, newHierarchy);
            code = newHierarchy.code;
            titleEn = newHierarchy.titleEn;
            isLeaf = newHierarchy.isLeaf;
            level = newHierarchy.level;
          } else {
            // If we don't have the hierarchy, we can't add the role
            // Note, this should not happen
            continue;
          }
        }
      }

      if (roleMap.has(code)) {
        const existingRole = roleMap.get(code);
        if (existingRole) {
          existingRole.count++;
        }
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
    }

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
