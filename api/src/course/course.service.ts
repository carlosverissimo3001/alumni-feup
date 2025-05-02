import { Injectable, NotFoundException } from '@nestjs/common';
import { CourseExtended } from '@entities';
import { PrismaService } from 'src/prisma/prisma.service';
import { FindCoursesDto } from '@/dto/find-courses.dto';

@Injectable()
export class CourseService {
  constructor(private readonly prisma: PrismaService) {}

  async find(params: FindCoursesDto): Promise<CourseExtended[]> {
    return this.prisma.course.findMany({
      where: {
        facultyId: {
          in: params.facultyIds,
        },
        id: {
          in: params.courseIds,
        },
      },
    });
  }

  async findOne(id: string): Promise<CourseExtended> {
    const course = await this.prisma.course.findUnique({ where: { id } });
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    return course;
  }
}

export default CourseService;
