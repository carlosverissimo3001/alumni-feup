import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { EscoClassificationDto } from '@/dto';
@Injectable()
export class EscoService {
  constructor(private readonly prismaService: PrismaService) {}

  async getLevelOneClassifications(): Promise<EscoClassificationDto[]> {
    const classifications =
      await this.prismaService.escoClassification.findMany({
        select: {
          code: true,
          titleEn: true,
        },
        where: {
          // I know it's not intuitive, but level 1 of granularity means level 4 of the classification
          level: 4,
        },
      });

    // TODO: Sort by popularity, i.e, the number of roles classified into each

    return classifications.map((classification) => ({
      escoCode: classification.code,
      title: classification.titleEn,
    }));
  }

  async getLevelTwoClassifications(): Promise<EscoClassificationDto[]> {
    const classifications =
      await this.prismaService.escoClassification.findMany({
        select: {
          code: true,
          titleEn: true,
        },
        where: {
          // The most possible granular classifications -> no children
          isLeaf: true,
        },
      });

    // TODO: Sort by popularity, i.e, the number of roles classified into each

    return classifications.map((classification) => ({
      escoCode: classification.code,
      title: classification.titleEn,
    }));
  }
}
