import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { RoleOptionDto } from '@/analytics/dto/role-option.dto';

@Injectable()
export class RoleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async count(): Promise<number> {
    return this.prisma.role.count();
  }

  async findAllClassifications(): Promise<RoleOptionDto[]> {
    return this.prisma.jobClassification.findMany({
      distinct: ['escoCode'],
      select: {
        escoCode: true,
        title: true,
        level: true,
      },
    });
  }
}
