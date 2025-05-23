import { Injectable } from '@nestjs/common';
import { Faculty } from 'src/entities/faculty.entity';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateFacultyDto } from '../dto';

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
   * @param {CreateFacultyDto} createFacultyDto
   * @returns {Promise<Faculty>}
   */
  async create(createFacultyDto: CreateFacultyDto): Promise<Faculty> {
    return this.prisma.faculty.create({
      data: {
        ...createFacultyDto,
        createdBy: createFacultyDto.createdBy ?? DEFAULT_CREATED_BY,
      },
    });
  }
}
