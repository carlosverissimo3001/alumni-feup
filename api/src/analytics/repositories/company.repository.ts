import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { QueryParamsDto } from '../dto/query-params.dto';
import { buildWhereClause } from '../utils/query-builder';
import { CompanyAnalyticsEntity } from '../entities/company.entity';
import { toCompanyAnalyticsEntity } from '../utils/company.mapper';

@Injectable()
export class CompanyAnalyticsRepository {
  constructor(
    private prisma: PrismaService,
    private logger: Logger,
  ) {}

  /* Note: Try to return the company entity to the service, and let it handle the mapping to the DTO that will be passed to the controller.
  This way, we can keep the repository focused on the data access logic, and the service focused on the business logic.
  The DAL should have no knowledge of DTOs, just entities.
  Nice read here: https://medium.com/@gmmiso88/nestjs-passing-data-between-layers-in-domain-driven-design-4899bcd7f872
  */

  async find(params: QueryParamsDto): Promise<CompanyAnalyticsEntity[]> {
    const { companyWhere, roleWhere } = buildWhereClause(params);

    // Fetch the companies
    const companies = await this.prisma.company.findMany({
      where: companyWhere,
      select: {
        id: true,
        name: true,
        logo: true,
        Industry: true,
        Role: {
          where: roleWhere ? roleWhere : undefined,
          select: {
            id: true,
            alumniId: true,
          },
        },
      },
      // Note: Since we're doing some mapping, we'll do the pagination in the service.
      /*skip: params.offset,
      take: params.limit,
      orderBy,*/
    });

    return companies.map((company) => toCompanyAnalyticsEntity(company));
  }

  async count(params: QueryParamsDto) {
    const { companyWhere } = buildWhereClause(params);

    return this.prisma.company.count({
      where: companyWhere,
    });
  }
}
