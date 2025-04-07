import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Alumni } from 'src/entities/alumni.entity';
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

  async findAll(): Promise<Alumni[]> {
    return this.prisma.alumni.findMany({
      select: alumniSelect,
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
                    ? [{ course_id: { in: courseIdsArray } }]
                    : []),
                  ...(conclusionYearsArray.length
                    ? [{ conclusion_year: { in: conclusionYearsArray } }]
                    : []),
                ],
              },
            },
          }
        : {};

        const rolesWhere = 
        selectedYear != undefined ? {
          Roles: {
            some: {
              start_date: {
                lte: new Date(selectedYear, 0, 1), 
              },
              AND: [
                {
                  OR: [
                    {
                      end_date: {
                        gte: new Date(selectedYear, 0, 1), 
                      },
                    },
                    { end_date: null },
                  ],
                },
              ],
            },
      }} : {};
        
    const alumniWhere = {
      ...graduationsFilter,
      //...rolesWhere,
      Location: {
        is: {
          latitude: { not: null },
          longitude: { not: null },
        },
      },
    };

    return this.prisma.alumni.findMany({
      where: alumniWhere,
      select: alumniSelect,
    });
  }
}
