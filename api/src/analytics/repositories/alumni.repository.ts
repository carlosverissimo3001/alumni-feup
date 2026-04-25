import { PrismaService } from '@/prisma/prisma.service';
import { QueryParamsDto } from '../dto/query-params.dto';
import { buildWhereClause } from '../utils/query-builder';
import { Injectable } from '@nestjs/common';
import {
  mapAlumniFromPrisma,
  mapRoleFromPrisma,
  RawAlumni,
} from '../utils/mapper';
import { AlumniAnalyticsEntity } from '../entities/alumni.entity';
import { graduationSelect, roleSelect } from '../utils/selectors';
import { SELECTOR_TYPE } from '../consts/enum';

@Injectable()
export class AlumniAnalyticsRepository {
  constructor(private prisma: PrismaService) {}

  /**
   * The most important method of this whole thing - fetches all the data
   * @param params - The parameters for the query
   * @returns The alumni analytics entities
   */
  async find(params: QueryParamsDto): Promise<AlumniAnalyticsEntity[]> {
    const { alumniWhere, roleWhere } = buildWhereClause(params);

    const includeGraduations =
      params.selectorType === SELECTOR_TYPE.EDUCATION ||
      params.selectorType === SELECTOR_TYPE.ALL;

    const alumnus = (await this.prisma.alumni.findMany({
      where: alumniWhere,
      select: {
        id: true,
        fullName: true,
        linkedinUrl: true,
        profilePictureUrl: true,
        Roles: {
          where: roleWhere,
          select: roleSelect,
        },
        ...(includeGraduations && {
          Graduations: {
            select: graduationSelect,
          },
        }),
      },
      // Pagination
      take: params.limit,
      skip: params.offset,
      orderBy: { fullName: params.sortOrder || 'asc' },
    })) as unknown as RawAlumni[];

    return alumnus.map(mapAlumniFromPrisma);
  }

  async findAllAlumni() {
    const alumni = await this.prisma.alumni.findMany({
      select: {
        id: true,
        fullName: true,
        linkedinUrl: true,
        profilePictureUrl: true,
      },
    });

    return alumni;
  }

  async findAllAlumniRoles(id: string) {
    const roles = await this.prisma.role.findMany({
      where: { alumniId: id },
      select: roleSelect,
    });

    return roles.map(mapRoleFromPrisma);
  }

  /** For a given alumni, find the oldest role
   * @param id - The id of the alumni
   * @returns The oldest role
   */
  async findOldestAlumniRole(id: string) {
    const roles = await this.prisma.role.findMany({
      where: { alumniId: id },
      select: roleSelect,
      orderBy: { startDate: 'asc' },
      take: 1,
    });

    return roles[0] ? mapRoleFromPrisma(roles[0]) : undefined;
  }

  async findOldestRolesStartDates(alumniIds: string[]) {
    // Get the earliest start date for each alumni in the list
    const results = await this.prisma.role.groupBy({
      by: ['alumniId'],
      where: {
        alumniId: { in: alumniIds },
      },
      _min: {
        startDate: true,
      },
    });

    return results.map((res) => ({
      alumniId: res.alumniId,
      startDate: res._min.startDate,
    }));
  }

  async countAlumni(params?: QueryParamsDto) {
    if (!params) {
      return this.prisma.alumni.count();
    }

    const { alumniWhere } = buildWhereClause(params);

    return this.prisma.alumni.count({
      where: alumniWhere,
    });
  }

  async getSeniorityCounts(params: QueryParamsDto) {
    const { alumniWhere, roleWhere } = buildWhereClause(params);

    return this.prisma.role.groupBy({
      by: ['seniorityLevel'],
      where: {
        ...roleWhere,
        Alumni: alumniWhere,
      },
      _count: {
        _all: true,
      },
    });
  }

  async getCompanyAggregates(params: QueryParamsDto) {
    const { alumniWhere, roleWhere } = buildWhereClause(params);

    // This query fetches companies that have at least one role matching the filters,
    // and returns the count of matching roles per company.
    // This is much more memory efficient than fetching all alumni.
    return this.prisma.company.findMany({
      where: {
        roles: {
          some: {
            ...roleWhere,
            Alumni: alumniWhere,
          },
        },
      },
      select: {
        id: true,
        name: true,
        logo: true,
        industryId: true,
        levelsFyiUrl: true,
        Industry: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            roles: {
              where: {
                ...roleWhere,
                Alumni: alumniWhere,
              },
            },
          },
        },
      },
    });
  }

  async getLocationAggregates(params: QueryParamsDto) {
    const { alumniWhere, roleWhere } = buildWhereClause(params);

    return this.prisma.location.findMany({
      where: {
        Role: {
          some: {
            ...roleWhere,
            Alumni: alumniWhere,
          },
        },
      },
      select: {
        id: true,
        city: true,
        country: true,
        countryCode: true,
        latitude: true,
        longitude: true,
        _count: {
          select: {
            Role: {
              where: {
                ...roleWhere,
                Alumni: alumniWhere,
              },
            },
          },
        },
      },
    });
  }

  async getEducationAggregates(params: QueryParamsDto) {
    const { alumniWhere } = buildWhereClause(params);

    return this.prisma.graduation.findMany({
      where: {
        Alumni: alumniWhere,
      },
      select: {
        courseId: true,
        conclusionYear: true,
        Course: {
          select: {
            id: true,
            name: true,
            acronym: true,
            Faculty: {
              select: {
                id: true,
                name: true,
                acronym: true,
              },
            },
          },
        },
      },
      distinct: ['alumniId', 'courseId'], // Ensure one count per alumni per course
    });
  }

  async getJobClassificationAggregates(params: QueryParamsDto) {
    const { alumniWhere, roleWhere } = buildWhereClause(params);

    return this.prisma.jobClassification.findMany({
      where: {
        Role: {
          ...roleWhere,
          Alumni: alumniWhere,
        },
      },
      select: {
        escoClassificationId: true,
        EscoClassification: {
          select: {
            titleEn: true,
            code: true,
            isLeaf: true,
            level: true,
          },
        },
      },
    });
  }
}
