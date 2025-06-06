import { PrismaService } from '@/prisma/prisma.service';
import { QueryParamsDto } from '../dto/query-params.dto';
import { buildWhereClause } from '../utils/query-builder';
import { Injectable } from '@nestjs/common';
import { mapAlumniFromPrisma, mapRoleFromPrisma } from '../utils/mapper';
import { AlumniAnalyticsEntity } from '../entities/alumni.entity';
import { graduationSelect, roleSelect } from '../utils/selectors';
import { Prisma } from '@prisma/client';

export type AnalyticsSelect = {
  includeRoles?: boolean;
  includeGraduations?: boolean;
  roleSelect?: Prisma.RoleSelect;
  graduationSelect?: Prisma.GraduationSelect;
};

@Injectable()
export class AlumniAnalyticsRepository {
  constructor(private prisma: PrismaService) {}

  async find(
    params: QueryParamsDto,
    select?: AnalyticsSelect,
  ): Promise<AlumniAnalyticsEntity[]> {
    const { alumniWhere, roleWhere } = buildWhereClause(params);

    const selectObj: Prisma.AlumniSelect = {
      id: true,
      fullName: true,
      linkedinUrl: true,
      profilePictureUrl: true,
    };

    if (select?.includeRoles) {
      selectObj.Roles = {
        where: roleWhere,
        select: select.roleSelect || roleSelect,
      };
    }

    if (select?.includeGraduations) {
      selectObj.Graduations = {
        select: select.graduationSelect || graduationSelect,
      };
    }

    const alumnus = await this.prisma.alumni.findMany({
      where: alumniWhere,
      select: selectObj,
    });

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
