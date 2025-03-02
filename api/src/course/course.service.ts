import { Injectable, NotFoundException } from '@nestjs/common';
import { CourseExtended } from '@entities';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CourseService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<CourseExtended[]> {
    return this.prisma.course.findMany();
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
