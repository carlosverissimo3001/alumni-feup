import { Injectable } from '@nestjs/common';
import { Faculty } from 'src/entities/faculty.entity';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FacultyService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find all faculties
   * @returns {Promise<Faculty[]>}
   */
  async findAll(): Promise<Faculty[]> {
    return this.prisma.faculty.findMany();
  }
}
