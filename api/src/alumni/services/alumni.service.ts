import { Injectable, NotFoundException } from '@nestjs/common';
import { Alumni } from 'src/entities/alumni.entity';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAlumniDto } from '../../dto/create-alumni.dto';
import { alumniSelect } from 'src/prisma/includes/alumni.include';

const CREATED_BY = 'alumni-api';

@Injectable()
export class AlumniService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Alumni[]> {
    const alumni = await this.prisma.alumni.findMany({
      select: alumniSelect,
    });
    return alumni;
  }

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

  async create(body: CreateAlumniDto): Promise<Alumni> {
    const alumni = await this.prisma.alumni.create({
      data: {
        ...body,
        created_by: CREATED_BY,
      },
      select: alumniSelect,
    });
    return alumni;
  }
}
