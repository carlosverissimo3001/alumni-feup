import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Alumni, AlumniExtended } from 'src/entities/alumni.entity';
import { alumniSelect } from 'src/prisma/includes/alumni.include';
import { GetGeoJSONDto } from 'src/dto/getgeojson.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class AlumniRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: Logger,
  ) {}

  async find(params: Prisma.AlumniWhereInput): Promise<Alumni | null> {
    const alumni = await this.prisma.alumni.findFirst({
      where: params,
      select: alumniSelect,
    });
    return alumni;
  }

  async update(id: string, params: Prisma.AlumniUpdateInput): Promise<Alumni> {
    return this.prisma.alumni.update({
      where: { id },
      data: params,
      select: alumniSelect,
    });
  }

  async findAll(params?: Prisma.AlumniWhereInput): Promise<Alumni[]> {
    return this.prisma.alumni.findMany({
      where: params,
      select: alumniSelect,
    });
  }

  async findAllToReview(): Promise<AlumniExtended[]> {
    return this.prisma.alumni.findMany({
      where: { wasReviewed: false },
      select: {
        ...alumniSelect,
        createdAt: true,
      },
    });
  }

  async findAllGeoJSON(query: GetGeoJSONDto): Promise<Alumni[]> {
    const { courseIds, conclusionYears, selectedYear } = query;

    // Ensure arrays for Prisma
    const courseIdsArray = Array.isArray(courseIds)
      ? courseIds
      : courseIds
        ? [courseIds]
        : [];

    const conclusionYearsArray = Array.isArray(conclusionYears)
      ? conclusionYears.map(Number)
      : conclusionYears
        ? [Number(conclusionYears)]
        : [];

    const graduationsFilter =
      courseIdsArray.length || conclusionYearsArray.length
        ? {
            Graduations: {
              some: {
                AND: [
                  ...(courseIdsArray.length
                    ? [{ courseId: { in: courseIdsArray } }]
                    : []),
                  ...(conclusionYearsArray.length
                    ? [{ conclusionYear: { in: conclusionYearsArray } }]
                    : []),
                ],
              },
            },
          }
        : {};

    const rolesWhere =
      selectedYear != undefined
        ? {
            Roles: {
              some: {
                startDate: {
                  lte: new Date(selectedYear, 0, 1),
                },
                AND: [
                  {
                    OR: [
                      {
                        endDate: {
                          gte: new Date(selectedYear, 0, 1),
                        },
                      },
                      { endDate: null },
                    ],
                  },
                ],
              },
            },
          }
        : {};

    const alumniWhere = {
      ...graduationsFilter,
      //...rolesWhere,
      Location: {
        is: {
          latitude: { not: null },
          longitude: { not: null },
        },
      },
      wasReviewed: true,
    };

    return this.prisma.alumni.findMany({
      where: alumniWhere,
      select: alumniSelect,
    });
  }

  async findAllWithReviews(): Promise<AlumniExtended[]> {
    const alumni = await this.prisma.alumni.findMany({
      where: {
        OR: [
          { ReviewsCompany: { some: {} } },
          { ReviewsLocation: { some: {} } },
        ],
      },
      select: alumniSelect,
    });
    return alumni;
  }
}
