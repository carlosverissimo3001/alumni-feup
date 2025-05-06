import { RoleListResponseDto, QueryParamsDto, RoleOptionDto } from '@/analytics/dto';
import { AlumniAnalyticsRepository } from '@/analytics/repositories';
import { Injectable } from '@nestjs/common';
import { RoleListDto } from '../dto/role-list.dto';
import {
  DEFAULT_QUERY_LIMIT,
  DEFAULT_QUERY_OFFSET,
  DEFAULT_QUERY_SORT_BY,
} from '../utils/consts';
import { DEFAULT_QUERY_SORT_ORDER } from '../utils/consts';
import { SortBy } from '../utils';
import { PrismaService } from '@/prisma/prisma.service';
@Injectable()
export class RoleAnalyticsService {
  constructor(
    private readonly alumniRepository: AlumniAnalyticsRepository,
    private readonly prisma: PrismaService,
  ) {}

  async getRolesWithCounts(
    query: QueryParamsDto,
  ): Promise<RoleListResponseDto> {
    const alumni = await this.alumniRepository.find(query);
    const roleMap = new Map<string, RoleListDto>();

    // We'll probably get this from the query
    const level = 1;

    // Flatten all alumni roles and their job classifications
    alumni
      .flatMap((alumni) => alumni.roles || [])
      .filter(
        (role) => role.jobClassification && role.jobClassification.length > 0,
      )
      .forEach((role) => {
        const bestClassification = role.jobClassification?.find(
          (classification) => classification.ranking === 1,
        );

        if (bestClassification) {
          const { escoCode, title } = bestClassification;

          if (roleMap.has(escoCode)) {
            roleMap.get(escoCode)!.roleCount++;
          } else {
            roleMap.set(escoCode, {
              title,
              code: escoCode,
              level,
              roleCount: 1,
            });
          }
        }
      });

    const roles = Array.from(roleMap.values());

    const rolesOrdered = this.orderRoles(roles, {
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
      totalCount: roles.length,
    };
  }

  // TODO: Move this to the repository
  async findAllClassifications(): Promise<RoleOptionDto[]> {
    // Dedupe by escoCode
    return this.prisma.jobClassification.findMany({
      distinct: ['escoCode'],
      select: {
        escoCode: true,
        title: true,
      },
    });
  }

  orderRoles(
    roles: RoleListDto[],
    order: {
      sortBy: SortBy;
      direction: 'asc' | 'desc';
    },
  ) {
    return roles.sort((a, b) => {
      let comparison = 0;

      switch (order.sortBy) {
        case SortBy.ROLE_COUNT:
          comparison = a.roleCount - b.roleCount;
          break;
        case SortBy.NAME:
          comparison = a.title.localeCompare(b.title);
          break;
        default:
          comparison = a.roleCount - b.roleCount;
      }

      if (order.direction === 'desc') {
        comparison = -comparison;
      }

      return comparison;
    });
  }
}
