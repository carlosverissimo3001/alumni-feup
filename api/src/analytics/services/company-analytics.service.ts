import { PrismaService } from '@/prisma/prisma.service';
import { QueryParamsDto } from '../dto/query-params.dto';
import {
  CompanyAnalyticsRepository,
  AlumniAnalyticsRepository,
} from '../repositories';
import { Injectable } from '@nestjs/common';
import {
  CompanyListResponseDto,
  IndustryListItemDto,
  IndustryListResponseDto,
} from '../dto';
import { SortBy } from '../utils/types';
import { CompanyListItemDto } from '../dto/company-list.dto';

/* Mental note: Try not to use prisma directly in services.
Shouldd use be used in the DAL, ie. repositories.
*/
@Injectable()
export class CompanyAnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly companyRepository: CompanyAnalyticsRepository,
    private readonly alumniRepository: AlumniAnalyticsRepository,
  ) {}

  async getCompaniesWithAlumniCount(
    query: QueryParamsDto,
  ): Promise<CompanyListResponseDto> {
    /* Note: Assuming the repo will return the company entity, we will do the DTO mapping here 
      Do this if time allows, but it is imporatnt for maintainability.
    */

    const companies = await this.companyRepository.find(query);
    const alumniCount = await this.alumniRepository.countAlumni(query);

    const companiesWithAlumniCount = companies.map((company) => {
      const alumniSet = new Set();

      company.roles.forEach((role) => {
        alumniSet.add(role.alumniId);
      });

      return {
        id: company.id,
        name: company.name,
        alumniCount: alumniSet.size,
        logo: company.logo || null,
      };
    });

    const totalCompanies = await this.companyRepository.count(query);

    const companiesWithAlumniCountOrdered = this.orderCompanies(
      companiesWithAlumniCount,
      {
        sortBy: query.sortBy,
        direction: query.sortOrder,
      },
    );

    const companiesWithAlumniCountPaginated =
      companiesWithAlumniCountOrdered.slice(
        query.offset,
        query.offset + query.limit,
      );

    return {
      companies: companiesWithAlumniCountPaginated,
      companyTotalCount: totalCompanies,
      alumniTotalCount: alumniCount,
    };
  }

  async getIndustryWithCounts(
    query: QueryParamsDto,
  ): Promise<IndustryListResponseDto> {
    const industriesMap = new Map<
      string,
      { name: string; companyCount: number; alumniCount: number }
    >();

    const companies = await this.companyRepository.find({
      ...query,
      // I'm sorry, I'm doing this so we can apply the ordering first, and then apply the pagination.
      offset: 0,
      limit: Number.MAX_SAFE_INTEGER,
    });

    companies.forEach((company) => {
      const industryId = company.industry.id;

      if (!industriesMap.has(industryId)) {
        industriesMap.set(industryId, {
          name: company.industry.name,
          companyCount: 0,
          alumniCount: 0,
        });
      }

      const industryData = industriesMap.get(industryId)!; // We just made sure it exists above, so we're gucci

      const alumniSet = new Set();
      company.roles.forEach((role) => alumniSet.add(role.alumniId));
      industryData.alumniCount += alumniSet.size;

      industryData.companyCount += 1;
    });

    const industries = Array.from(industriesMap.entries()).map(
      ([industryId, data]) => ({
        id: industryId,
        name: data.name,
        companyCount: data.companyCount,
        alumniCount: data.alumniCount,
      }),
    );

    const industriesOrdered = this.orderIndustries(industries, {
      sortBy: query.sortBy,
      direction: query.sortOrder,
    });

    const industriesPaginated = industriesOrdered.slice(
      query.offset,
      query.offset + query.limit,
    );

    return {
      industries: industriesPaginated,
      total: industries.length,
    };
  }

  async getCompanyGrowth() {
    return [];
  }

  orderIndustries(
    industries: IndustryListItemDto[],
    order: {
      sortBy: SortBy;
      direction: 'asc' | 'desc';
    },
  ) {
    return industries.sort((a, b) => {
      let comparison = 0;

      switch (order.sortBy) {
        case SortBy.ALUMNI_COUNT:
          comparison = a.alumniCount - b.alumniCount;
          break;
        case SortBy.INDUSTRY_NAME:
          comparison = a.name.localeCompare(b.name);
          break;
        default:
          comparison = a.alumniCount - b.alumniCount;
      }

      if (order.direction === 'desc') {
        comparison = -comparison;
      }

      return comparison;
    });
  }

  orderCompanies(
    companies: CompanyListItemDto[],
    order: {
      sortBy: SortBy;
      direction: 'asc' | 'desc';
    },
  ) {
    return companies.sort((a, b) => {
      let comparison = 0;

      switch (order.sortBy) {
        case SortBy.ALUMNI_COUNT:
          comparison = a.alumniCount - b.alumniCount;
          break;
        case SortBy.COMPANY_NAME:
          comparison = a.name.localeCompare(b.name);
          break;
        default:
          comparison = a.alumniCount - b.alumniCount;
      }

      if (order.direction === 'desc') {
        comparison = -comparison;
      }

      return comparison;
    });
  }
}
