import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Alumni } from 'src/entities/alumni.entity';
import { alumniSelect } from 'src/prisma/includes/alumni.include';
import { CreateAlumniDto } from 'src/dto/create-alumni.dto';
import { GetGeoJSONDto } from 'src/dto/getgeojson.dto';
import { GRADUATION_STATUS } from '@prisma/client';

@Injectable()
export class AlumniRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: Logger,
  ) {}

  async findOne(id: string): Promise<Alumni> {
    const alumni = await this.prisma.alumni.findUnique({
      where: { id },
      select: alumniSelect,
    });

    if (!alumni) {
      throw new NotFoundException(`Alumni with ID ${id} not found`);
    }

    return alumni;
  }

  async findAll(): Promise<Alumni[]> {
    return this.prisma.alumni.findMany({
      select: alumniSelect,
    });
  }

  async create(body: CreateAlumniDto): Promise<Alumni> {
    const alumni = await this.prisma.alumni.create({
      data: body,
      select: alumniSelect,
    });
    return alumni;
  }

  async findAllGeoJSON(query: GetGeoJSONDto): Promise<Alumni[]> {
    const { courseIds, conclusionYears } = query;

    /* const fe_string = '2026';
    const active_date = new Date(fe_string); */

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
                  { status: GRADUATION_STATUS.GRADUATED },
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

    const alumniWhere = {
      ...graduationsFilter,
      Location: {
        is: {
          latitude: { not: null },
          longitude: { not: null },
        },
      },
    };

    /* return this.prisma.alumni.findMany({
      where: {
        ...alumniWhere,
        Roles: {
          some: {
            AND: [
              {
                start_date: {
                  lte: active_date,
                },
              },
              {
                OR: [
                  {
                    end_date: {
                      gte: active_date,
                    },
                  },
                  {
                    end_date: null,
                  },
                ],
              },
            ],
          },
        },
      },
      select: alumniSelect,
    }); */
    return this.prisma.alumni.findMany({
      where: alumniWhere,
      select: alumniSelect,
    });
  }
}
