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

    console.log('Will include graduations', includeGraduations);

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
      // Need this as prisma can't infer nested relations when the
      // graduation select is optional
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
