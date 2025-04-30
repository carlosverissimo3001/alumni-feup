import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class IndustryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.industry.findMany();
  }
}
