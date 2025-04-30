import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { CompanySummaryEntity } from '../entities';

@Injectable()
export class CompanyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<CompanySummaryEntity[]> {
    return this.prisma.company.findMany({
      select: {
        id: true,
        name: true,
      },
    });
  }
}
