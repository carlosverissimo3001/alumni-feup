import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { CompanySummaryEntity, CompanyAnalyticsEntity } from '../entities';
import { companySelect } from '../utils/selectors';
import { Prisma } from '@prisma/client';
import { mapCompanyFromPrisma } from '../utils/alumni.mapper';
const extendedSelect = {
  ...companySelect,
  founded: true,
  companySize: true,
  linkedinUrl: true,
  companyType: true,
  website: true,
} satisfies Prisma.CompanySelect;

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

  async count(): Promise<number> {
    return this.prisma.company.count();
  }

  async countIndustries() {
    const industries = await this.prisma.company.groupBy({
      by: ['industryId'],
      _count: {
        _all: true,
      },
    });

    return industries.length;
  }

  async findById(id: string): Promise<CompanyAnalyticsEntity> {
    const company = await this.prisma.company.findUnique({
      where: { id },
      select: extendedSelect,
    });

    if (!company) {
      throw new Error('Company not found');
    }

    console.log(company);

    return mapCompanyFromPrisma(company);
  }
}
