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
import { RoleAnalyticsEntity } from '../entities/role.entity';
import { GetRoleDto } from '../dto/get-role.dto';
import { AlumniAnalyticsEntity } from '../entities';

@Injectable()
export class RoleAnalyticsService {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly trendAnalyticsService: TrendAnalyticsService,
    private readonly alumniRepository: AlumniAnalyticsRepository,
    private readonly logger: Logger,
  ) {}

  async getRoleAnalytics(
    alumnusUnfiltered: AlumniAnalyticsEntity[],
    query: QueryParamsDto,
  ): Promise<RoleListResponseDto> {
    const requestedLevel = query.escoClassificationLevel ?? 5;
    const isGranular = requestedLevel && requestedLevel >= 5;

    const classificationAggregates = await this.alumniRepository.getJobClassificationAggregates(query);

    const roleMap = new Map<string, RoleListItemDto>();
    const uniqueCodesToFetch = new Set<string>();

    for (const job of classificationAggregates) {
      if (!job.EscoClassification) continue;

      let actualCode: string | undefined;
      const roleLevel = job.EscoClassification.level;
      const rawCode = job.EscoClassification.code;

      if (isGranular && requestedLevel && roleLevel < requestedLevel) {
        continue;
      }

      if (isGranular && requestedLevel) {
        if (roleLevel === requestedLevel) {
          actualCode = rawCode;
        } else {
          const parts = rawCode.split('.');
          const baseCode = parts[0];
          const relevantParts = parts.slice(1, requestedLevel - 3);
          actualCode = baseCode + '.' + relevantParts.join('.');
        }
      } else {
        actualCode = rawCode.slice(0, requestedLevel);
      }

      if (!actualCode) continue;

      const existingRole = roleMap.get(actualCode);
      if (existingRole) {
        existingRole.count++;
      } else {
        uniqueCodesToFetch.add(actualCode);
        roleMap.set(actualCode, {
          name: '', // Will be filled once we fetch hierarchy
          code: actualCode,
          level: requestedLevel || roleLevel,
          escoUrl: '',
          count: 1,
          trend: [],
        });
      }
    }

    if (uniqueCodesToFetch.size > 0) {
      const classifications = await this.roleRepository.getClassifications(
        Array.from(uniqueCodesToFetch),
      );
      classifications.forEach((classification) => {
        if (classification) {
          const role = roleMap.get(classification.code);
          if (role) {
            role.name = classification.titleEn;
            role.escoUrl = classification.escoUrl ?? '';
          }
        }
      });
    }

    const roles = Array.from(roleMap.values());

    if (query.includeRoleTrend) {
      const trends = await Promise.all(
        roles.map((role) =>
          this.trendAnalyticsService.getRoleTrend({
            entityId: isGranular
              ? role.code
              : role.code.slice(0, requestedLevel),
            query,
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

  async getRoleOptions(): Promise<RoleOptionDto[]> {
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

  async getRole(id: string, params: GetRoleDto): Promise<RoleAnalyticsEntity> {
    return await this.roleRepository.findById(id, params);
  }
}
