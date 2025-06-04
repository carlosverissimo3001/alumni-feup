import { CourseAnalyticsEntity } from '@/analytics/entities';
import { mapCourseFromPrisma } from '@/analytics/utils/mapper';
import { FindCoursesDto } from '@/course/dto/find-courses.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCourseDto } from '../dto';

const DEFAULT_CREATED_BY = 'admin';
@Injectable()
export class CourseService {
  constructor(private readonly prisma: PrismaService) {}

  async find(params: FindCoursesDto): Promise<CourseAnalyticsEntity[]> {
    const courses = await this.prisma.course.findMany({
      where: {
        facultyId: {
          in: params.facultyIds,
        },
        id: {
          in: params.courseIds,
        },
      },
      include: { Faculty: true },
    });
    return courses.map((course) => mapCourseFromPrisma(course));
  }

  async findOne(id: string): Promise<CourseAnalyticsEntity> {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: { Faculty: true },
    });
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    return mapCourseFromPrisma(course);
  }

  async create(
    createCourseDto: CreateCourseDto,
  ): Promise<CourseAnalyticsEntity> {
    const course = await this.prisma.course.create({
      data: {
        ...createCourseDto,
        createdBy: createCourseDto.createdBy ?? DEFAULT_CREATED_BY,
      },
      include: { Faculty: true },
    });
    return mapCourseFromPrisma(course);
  }
}

export default CourseService;
