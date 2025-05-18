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
    const classifications = await this.prisma.escoClassification.findMany({
      distinct: ['code'],
      select: {
        code: true,
        titleEn: true,
        level: true,
      },
      where: {
        isLeaf: true,
      },
    });

    return classifications.map((classification) => ({
      escoCode: classification.code,
      title: classification.titleEn,
      level: classification.level,
    }));
  }
}
