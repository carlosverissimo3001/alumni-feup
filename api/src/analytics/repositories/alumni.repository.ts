import { PrismaService } from '@/prisma/prisma.service';
import { QueryParamsDto } from '../dto/query-params.dto';
import { buildWhereClause } from '../utils/query-builder';
import { Injectable, Logger } from '@nestjs/common';
import { toAlumniAnalyticsEntity, toRoleAnalyticsEntity } from '../utils/alumni.mapper';
import { AlumniAnalyticsEntity } from '../entities/alumni.entity';
import { roleSelect } from '../utils/selectors';
import { RoleAnalyticsEntity } from '../entities/role.entity';

@Injectable()
export class AlumniAnalyticsRepository {
  constructor(
    private prisma: PrismaService,
    private readonly logger: Logger,
  ) {}

  async find(params: QueryParamsDto): Promise<AlumniAnalyticsEntity[]> {
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

  async findAllAlumniRoles(id: string) {
    const roles = await this.prisma.role.findMany({
      where: { alumniId: id },
      select: roleSelect,
    });

    return roles;
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

    return roles[0];
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
}
