import { PrismaService } from '@/prisma/prisma.service';
import { QueryParamsDto } from '../dto/query-params.dto';
import { buildWhereClause } from '../utils/query-builder';
import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { toAlumniAnalyticsEntity } from '../utils/alumni.mapper';

const industrySelect = {
  id: true,
  name: true,
} satisfies Prisma.IndustrySelect;

const locationSelect = {
  id: true,
  country: true,
  countryCode: true,
  city: true,
};

const companySelect = {
  id: true,
  name: true,
  logo: true,
  Industry: {
    select: industrySelect,
  },
  Location: {
    select: locationSelect,
  },
};

const roleSelect = {
  id: true,
  alumniId: true,
  Location: {
    select: locationSelect,
  },
  Company: {
    select: companySelect,
  },
} satisfies Prisma.RoleSelect;

@Injectable()
export class AlumniAnalyticsRepository {
  constructor(
    private prisma: PrismaService,
    private readonly logger: Logger,
  ) {}

  async find(params: QueryParamsDto) {
    // Build all the filters using your existing function
    const { alumniWhere, roleWhere } = buildWhereClause(params);

    // Use the filters at the right levels
    const alumnus = await this.prisma.alumni.findMany({
      where: alumniWhere,
      select: {
        id: true,
        Roles: {
          where: roleWhere,
          select: roleSelect,
        },
      },
    });

    return alumnus.map(toAlumniAnalyticsEntity);
  }

  async countAlumni(params: QueryParamsDto) {
    const { alumniWhere } = buildWhereClause(params);

    return this.prisma.alumni.count({
      where: alumniWhere,
    });
  }
}
