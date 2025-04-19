import { PrismaService } from '@/prisma/prisma.service';
import { QueryParamsDto } from '../dto/query-params.dto';
import { buildWhereClause } from '../utils/query-builder';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class AlumniAnalyticsRepository {
  constructor(private prisma: PrismaService) {}

  async countAlumni(params: QueryParamsDto) {
    const { companyWhere, roleWhere } = buildWhereClause(params);

    const alumniWhere: Prisma.AlumniWhereInput = {};

    if (Object.keys(companyWhere).length > 0 || roleWhere) {
      alumniWhere.Roles = {
        some: {
          ...(Object.keys(companyWhere).length > 0 && {
            Company: companyWhere,
          }),
          ...(roleWhere && roleWhere),
        },
      };
    }

    return this.prisma.alumni.count({
      where: alumniWhere,
    });
  }

  async getAlumniByCountry(params: QueryParamsDto) {
    const { companyWhere, roleWhere } = buildWhereClause(params);

    const alumniWhere: Prisma.AlumniWhereInput = { Location: { isNot: null } };

    if (Object.keys(companyWhere).length > 0 || roleWhere) {
      alumniWhere.Roles = {
        some: {
          ...(Object.keys(companyWhere).length > 0 && {
            Company: companyWhere,
          }),
          ...(roleWhere && roleWhere),
        },
      };
    }

    return this.prisma.alumni.findMany({
      where: alumniWhere,
      include: {
        Location: true,
      },
    });
  }
}
