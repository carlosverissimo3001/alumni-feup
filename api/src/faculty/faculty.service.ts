import { Injectable } from '@nestjs/common';
import { Faculty } from 'src/entities/faculty.entity';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddFacultyDto } from '@/dto';

const DEFAULT_CREATED_BY = 'admin';
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

  /**
   * Create a faculty
   * @param {AddFacultyDto} addFacultyDto
   * @returns {Promise<Faculty>}
   */
  async create(addFacultyDto: AddFacultyDto): Promise<Faculty> {
    return this.prisma.faculty.create({
      data: {
        ...addFacultyDto,
        createdBy: addFacultyDto.createdBy ?? DEFAULT_CREATED_BY,
      },
    });
  }
}
