import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EducationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async countFaculties(): Promise<number> {
    return this.prisma.faculty.count();
  }

  async countCourses(): Promise<number> {
    return this.prisma.course.count();
  }

  async countGraduations(): Promise<number> {
    const graduations = await this.prisma.graduation.findMany({
      distinct: ['courseId', 'conclusionYear'],
    });

    return graduations.length;
  }
}
