// Note: For brevity, we're only supporting trend analysis for the past 30 years
import {
  AlumniAnalyticsEntity,
  RoleAnalyticsEntity,
  GraduationAnalyticsEntity,
} from '../entities';
import { FREQUENCY, TREND_TYPE } from '../consts';
import { Injectable } from '@nestjs/common';
import { subYears } from 'date-fns';
import { DataPointDto, QueryParamsDto } from '../dto';
import { getLabelForDate } from '../utils/date';
import { PrismaService } from '@/prisma/prisma.service';
import { buildWhereClause } from '../utils';

type TrendParams = {
  data: AlumniAnalyticsEntity[];
  entityId: string;
  type?: TREND_TYPE;
};

const THIRTY_YEARS_AGO = subYears(new Date(), 30);

@Injectable()
export class TrendAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getCompanyTrend(params: {
    entityId: string;
    query: QueryParamsDto;
  }): Promise<DataPointDto[]> {
    const { entityId, query } = params;
    const { alumniWhere, roleWhere } = buildWhereClause(query);

    const roles = await this.prisma.role.findMany({
      where: {
        ...roleWhere,
        companyId: entityId,
        Alumni: alumniWhere,
      },
      select: {
        startDate: true,
        endDate: true,
      },
    });

    return this.aggregateActiveRoles(roles as unknown as RoleAnalyticsEntity[]);
  }

  async getCountryTrend(params: {
    entityId: string;
    query: QueryParamsDto;
  }): Promise<DataPointDto[]> {
    const { entityId, query } = params;
    const { alumniWhere, roleWhere } = buildWhereClause(query);

    const roles = await this.prisma.role.findMany({
      where: {
        ...roleWhere,
        Alumni: alumniWhere,
        Location: { countryCode: entityId },
      },
      select: {
        startDate: true,
        endDate: true,
      },
    });

    return this.aggregateActiveRoles(roles as unknown as RoleAnalyticsEntity[]);
  }

  async getCityTrend(params: {
    entityId: string;
    query: QueryParamsDto;
  }): Promise<DataPointDto[]> {
    const { entityId, query } = params;
    const { alumniWhere, roleWhere } = buildWhereClause(query);

    const roles = await this.prisma.role.findMany({
      where: {
        ...roleWhere,
        Alumni: alumniWhere,
        locationId: entityId,
      },
      select: {
        startDate: true,
        endDate: true,
      },
    });

    return this.aggregateActiveRoles(roles as unknown as RoleAnalyticsEntity[]);
  }

  async getRoleTrend(params: {
    entityId: string;
    query: QueryParamsDto;
  }): Promise<DataPointDto[]> {
    const { entityId, query } = params;
    const { alumniWhere, roleWhere } = buildWhereClause(query);

    const roles = await this.prisma.role.findMany({
      where: {
        ...roleWhere,
        Alumni: alumniWhere,
        JobClassification: {
          EscoClassification: {
            code: {
              startsWith: entityId,
            },
          },
        },
      },
      select: {
        startDate: true,
        endDate: true,
      },
    });

    return this.aggregateActiveRoles(roles as unknown as RoleAnalyticsEntity[]);
  }

  async getSeniorityTrend(params: {
    entityId: string;
    query: QueryParamsDto;
  }): Promise<DataPointDto[]> {
    const { entityId, query } = params;
    const { alumniWhere, roleWhere } = buildWhereClause(query);

    const roles = await this.prisma.role.findMany({
      where: {
        ...roleWhere,
        Alumni: alumniWhere,
        seniorityLevel: entityId as any,
      },
      select: {
        startDate: true,
        endDate: true,
      },
    });

    return this.aggregateActiveRoles(roles as unknown as RoleAnalyticsEntity[]);
  }

  async getIndustryTrend(params: {
    entityId: string;
    query: QueryParamsDto;
  }): Promise<DataPointDto[]> {
    const { entityId, query } = params;
    const { alumniWhere, roleWhere } = buildWhereClause(query);

    const roles = await this.prisma.role.findMany({
      where: {
        ...roleWhere,
        Alumni: alumniWhere,
        Company: { Industry: { id: entityId } },
      },
      select: {
        startDate: true,
        endDate: true,
      },
    });

    return this.aggregateActiveRoles(roles as unknown as RoleAnalyticsEntity[]);
  }

  async getFacultyTrend(params: {
    entityId: string;
    query: QueryParamsDto;
  }): Promise<DataPointDto[]> {
    const { entityId, query } = params;
    const { alumniWhere } = buildWhereClause(query);

    const graduations = await this.prisma.graduation.findMany({
      where: {
        Alumni: alumniWhere,
        Course: { facultyId: entityId },
      },
      select: {
        conclusionYear: true,
      },
    });

    return this.aggregateActiveGraduations(
      graduations as unknown as GraduationAnalyticsEntity[],
    );
  }

  async getMajorTrend(params: {
    entityId: string;
    query: QueryParamsDto;
  }): Promise<DataPointDto[]> {
    const { entityId, query } = params;
    const { alumniWhere } = buildWhereClause(query);

    const graduations = await this.prisma.graduation.findMany({
      where: {
        Alumni: alumniWhere,
        courseId: entityId,
      },
      select: {
        conclusionYear: true,
      },
    });

    return this.aggregateActiveGraduations(
      graduations as unknown as GraduationAnalyticsEntity[],
    );
  }

  aggregateActiveRoles(roles: RoleAnalyticsEntity[]): DataPointDto[] {
    const dataPoints: DataPointDto[] = [];
    const now = new Date();
    let currentDate = new Date(THIRTY_YEARS_AGO);

    while (currentDate <= now) {
      // Count roles active in this month
      const activeRoles = roles.filter((role) => {
        const startDate = new Date(role.startDate);
        const endDate = role.endDate ? new Date(role.endDate) : null;
        return startDate <= currentDate && (!endDate || endDate >= currentDate);
      });

      dataPoints.push({
        label: getLabelForDate(currentDate, FREQUENCY.MONTHLY),
        value: activeRoles.length,
      });

      // Move to next month
      currentDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        1,
      );
    }

    return dataPoints;
  }

  aggregateActiveCompanies(roles: RoleAnalyticsEntity[]): DataPointDto[] {
    const dataPoints: DataPointDto[] = [];
    const now = new Date();
    let currentDate = new Date(THIRTY_YEARS_AGO);

    while (currentDate <= now) {
      // Get unique companies active in this month
      const activeCompanies = new Set(
        roles
          .filter((role) => {
            const startDate = new Date(role.startDate);
            const endDate = role.endDate ? new Date(role.endDate) : null;
            return (
              startDate <= currentDate && (!endDate || endDate >= currentDate)
            );
          })
          .map((role) => role.company.id),
      );

      dataPoints.push({
        label: getLabelForDate(currentDate, FREQUENCY.MONTHLY),
        value: activeCompanies.size,
      });

      // Move to next month
      currentDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        1,
      );
    }

    return dataPoints;
  }

  // Note: Naming is a bit weird, but essentially, here we aggregate the graduations
  // from a given faculty/course, per year, for the last 30 years
  aggregateActiveGraduations(
    graduations: GraduationAnalyticsEntity[],
  ): DataPointDto[] {
    const dataPoints: DataPointDto[] = [];
    const now = new Date();
    let currentDate = new Date(THIRTY_YEARS_AGO);

    while (currentDate <= now) {
      // Count graduations that happened in this specific year
      const activeGraduations = graduations.filter((graduation) => {
        return graduation.conclusionYear === currentDate.getFullYear();
      });

      dataPoints.push({
        label: getLabelForDate(currentDate, FREQUENCY.YEARLY),
        value: activeGraduations.length,
      });

      // Move to next year
      currentDate = new Date(currentDate.getFullYear() + 1, 0, 1);
    }

    return dataPoints;
  }
}
