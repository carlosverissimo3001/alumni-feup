import {
  RoleListResponseDto,
  QueryParamsDto,
  RoleOptionDto,
  RoleListItemDto,
  GetRoleHierarchyDto,
  RoleHierarchyDto,
  RoleHierarchyItemDto,
} from '@/analytics/dto';
import {
  AlumniAnalyticsRepository,
  RoleRepository,
} from '@/analytics/repositories';
import { Injectable, Logger } from '@nestjs/common';
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
import { RoleAnalyticsEntity } from '../entities/role.entity';

@Injectable()
export class RoleAnalyticsService {
  constructor(
    private readonly alumniRepository: AlumniAnalyticsRepository,
    private readonly roleRepository: RoleRepository,
    private readonly trendAnalyticsService: TrendAnalyticsService,
    private readonly logger: Logger,
  ) {}

  async getRolesWithCounts(
    query: QueryParamsDto,
  ): Promise<RoleListResponseDto> {
    const alumnusUnfiltered = await this.alumniRepository.find(query);

    const alumnus = applyDateFilters(alumnusUnfiltered, query);
    const requestedLevel = query.escoClassificationLevel;
    const isGranular = requestedLevel && requestedLevel >= 5;

    const allRoles = alumnus
      .flatMap((alumni) => alumni.roles || [])
      .filter((role) => role.jobClassification?.escoClassification);

    const uniqueCodes = new Map<string, string>();
    for (const role of allRoles) {
      let actualCode: string | undefined;
      let resolvedCode: string | undefined;

      const roleLevel = role.jobClassification!.escoClassification.level;
      const rawCode = role.jobClassification!.escoClassification.code;

      // Skip roles classified at a lower level than requested, if granular
      if (isGranular && requestedLevel && roleLevel < requestedLevel) {
        continue;
      }

      if (isGranular) {
        // If role is at the same level as requested, use it as is
        if (roleLevel === requestedLevel) {
          actualCode = rawCode;
          resolvedCode = rawCode;
        } else {
          // For roles at a higher level, truncate to requested level
          // e.g., for level 5, '2511.14.1' becomes '2511.14'
          const parts = rawCode.split('.');
          const baseCode = parts[0];
          const relevantParts = parts.slice(1, requestedLevel - 3); // -3 because first part is 4 digits
          actualCode = baseCode + '.' + relevantParts.join('.');
          resolvedCode = actualCode;
        }
      } else {
        actualCode = role.jobClassification!.escoClassification.code.slice(
          0,
          requestedLevel,
        );
        resolvedCode = actualCode;
      }
      if (!actualCode || !resolvedCode) continue;
      uniqueCodes.set(actualCode, resolvedCode);
    }

    const hierarchyMap = new Map<string, EscoClassificationAnalyticsEntity>();
    if (uniqueCodes.size > 0) {
      const classifications = await Promise.all(
        Array.from(uniqueCodes.values()).map(async (resolvedCode) => {
          const result =
            await this.roleRepository.getClassification(resolvedCode);
          return result;
        }),
      );
      classifications.forEach((classification) => {
        if (classification) {
          hierarchyMap.set(classification.code, classification);
        }
      });
    }

    const roleMap = new Map<string, RoleListItemDto>();
    for (const role of allRoles) {
      let { code, titleEn, level, escoUrl } =
        role.jobClassification!.escoClassification;

      // Let's return early if we don't have a hierarchy for this code
      const hierarchy = isGranular
        ? hierarchyMap.get(code)
        : hierarchyMap.get(code.slice(0, requestedLevel));
      if (!hierarchy) {
        continue;
      }
      code = hierarchy.code;
      titleEn = hierarchy.titleEn;
      level = hierarchy.level;
      escoUrl = hierarchy.escoUrl;

      const existingRole = roleMap.get(code);
      if (existingRole) {
        existingRole.count++;
      } else {
        roleMap.set(code, {
          name: titleEn,
          code: code,
          level: requestedLevel || level,
          escoUrl: escoUrl,
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
            entityId: isGranular
              ? role.code
              : role.code.slice(0, requestedLevel),
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

  async getRoleHierarchy(
    query: GetRoleHierarchyDto,
  ): Promise<RoleHierarchyDto> {
    const parts: RoleHierarchyItemDto[] = [];
    let currentCode = query.code;

    // Keep going up the hierarchy until we reach level 1
    while (currentCode.length > 0) {
      const classification =
        await this.roleRepository.getClassification(currentCode);
      if (!classification) {
        this.logger.warn(`No classification found for code: ${currentCode}`);
        break;
      }

      parts.unshift({
        title: classification.titleEn,
        code: currentCode,
        escoUrl: classification.escoUrl,
      });

      // Move up one level
      if (currentCode.length <= 1) break;

      // For level 1, we're done
      if (currentCode.length === 1) break;

      // For level 2-4, remove last digit
      if (currentCode.length <= 4) {
        currentCode = currentCode.slice(0, -1);
      } else {
        // For level 5+, remove everything after the last dot
        const lastDotIndex = currentCode.lastIndexOf('.');
        if (lastDotIndex === -1) {
          currentCode = currentCode.slice(0, -1);
        } else {
          currentCode = currentCode.slice(0, lastDotIndex);
        }
      }
    }

    return {
      hierarchy: parts,
    };
  }

  async getRole(id: string): Promise<RoleAnalyticsEntity> {
    return await this.roleRepository.findById(id);
  }
}
