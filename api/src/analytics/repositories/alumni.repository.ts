import { PrismaService } from '@/prisma/prisma.service';
import { QueryParamsDto } from '../dto/query-params.dto';
import { buildWhereClause } from '../utils/query-builder';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AlumniAnalyticsRepository {
  constructor(private prisma: PrismaService) {}

  async countAlumni(params: QueryParamsDto) {
    const { companyWhere } = buildWhereClause(params);

    const alumniWhere = Object.keys(companyWhere).length
      ? {
          Roles: {
            some: {
              Company: companyWhere,
            },
          },
        }
      : undefined;

    return this.prisma.alumni.count({
      where: alumniWhere,
    });
  }
}
