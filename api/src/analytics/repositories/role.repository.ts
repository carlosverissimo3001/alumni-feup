import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { RoleOptionDto } from '@/analytics/dto/role-option.dto';
import { EscoClassificationAnalyticsEntity } from '../entities/esco-classification.entity';

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
        level: { gte: 5 },
      },
    });

    return classifications.map((classification) => ({
      escoCode: classification.code,
      title: classification.titleEn,
      level: classification.level,
    }));
  }

  /**
   * Get a classification by its code
   * @param code - The code of the classification
   * @returns The classification
   */
  async getClassification(
    code: string,
  ): Promise<EscoClassificationAnalyticsEntity | undefined> {
    const classification = await this.prisma.escoClassification.findFirst({
      where: { code },
    });

    if (!classification) {
      return undefined;
    }

    return {
      titleEn: classification.titleEn,
      code: classification.code,
      isLeaf: classification.isLeaf,
      level: classification.level,
    };
  }
}
