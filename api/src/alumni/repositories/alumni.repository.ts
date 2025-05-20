import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Alumni, AlumniExtended } from 'src/entities/alumni.entity';
import { alumniSelect, alumniSelectOnlyCompany, alumniSelectOnlyLocation } from 'src/prisma/includes/alumni.include';
import { GetGeoJSONDto } from 'src/dto/getgeojson.dto';
import { Prisma } from '@prisma/client';
import { GetReviewGeoJSONDto } from '@/dto/getreviewgeojson.dto';
import { ReviewType } from '@/entities/reviewgeojson.entity';

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

  async findAllWithReviews(query: GetReviewGeoJSONDto): Promise<AlumniExtended[]> {

      const { rating, dateFrom, dateTo } = query;
      const dateFilter =
      dateFrom || dateTo
          ? {
              createdAt: {
                ...(dateFrom ? { gte: dateFrom } : {}),
                ...(dateTo ? { lte: dateTo } : {}),
              },
            }
          : {};
      const ratingFilter =
      rating != undefined
          ? { rating: rating }
          : {};
    if(query.reviewType === ReviewType.COMPANY.toString() ) {

      const alumni = await this.prisma.alumni.findMany({
        include: {
          ReviewsCompany: {
            include: { 
              Company: true,
              Location: true
            },
            where: {
              ...ratingFilter,
              ...dateFilter,
            },
          },
        },
      });
      return alumni;
    }else if(query.reviewType === ReviewType.LOCATION.toString()) {
      const alumni = await this.prisma.alumni.findMany({
        include: {
          ReviewsLocation: {
            include: { 
              Location: true
            },
            where: {
              ...ratingFilter,
              ...dateFilter,
            },
          },
        },
      });
      return alumni;
    }else{
      const alumni = await this.prisma.alumni.findMany({
        include: {
          ReviewsCompany: {
            include: { 
              Company: true,
              Location: true
             },
            where: {
              ...ratingFilter,
              ...dateFilter,
            },
          },
          ReviewsLocation: {
            include: {
              Location: true
             },
            where: {
              ...ratingFilter,
              ...dateFilter,
            },
          },
        },
      });
      return alumni;
    }
  }
}
