import { QueryParamsDto } from '../dto/query-params.dto';
import { AlumniAnalyticsRepository, CompanyRepository } from '../repositories';
import { Injectable } from '@nestjs/common';
import {
  CompanyListResponseDto,
  IndustryListItemDto,
  IndustryListResponseDto,
  CompanyOptionDto,
} from '../dto';
import { CompanyListItemExtendedDto } from '../dto/company-list.dto';
import {
  DEFAULT_QUERY_LIMIT,
  DEFAULT_QUERY_SORT_BY,
  DEFAULT_QUERY_SORT_ORDER,
  DEFAULT_QUERY_OFFSET,
} from '../utils/consts';
import { AlumniAnalyticsEntity } from '../entities/alumni.entity';
import { sortData } from '../utils';

/* Mental note: Try not to use prisma directly in services.
Shouldd use be used in the DAL, ie. repositories.
*/
@Injectable()
export class CompanyAnalyticsService {
  constructor(
    private readonly alumniRepository: AlumniAnalyticsRepository,
    private readonly companyRepository: CompanyRepository,
  ) {}

  async getCompaniesWithAlumniCount(
    query: QueryParamsDto,
  ): Promise<CompanyListResponseDto> {
    const alumnus = await this.alumniRepository.find(query);
    const alumniCount = alumnus.length;

    const companiesWithAlumniCount = this.getCompanyMap(alumnus);
    const companyCount = companiesWithAlumniCount.length;

    const companiesWithAlumniCountOrdered = sortData(companiesWithAlumniCount, {
      sortBy: query.sortBy || DEFAULT_QUERY_SORT_BY,
      direction: query.sortOrder || DEFAULT_QUERY_SORT_ORDER,
    });

    const companiesWithAlumniCountPaginated =
      companiesWithAlumniCountOrdered.slice(
        query.offset || DEFAULT_QUERY_OFFSET,
        (query.offset || DEFAULT_QUERY_OFFSET) +
          (query.limit || DEFAULT_QUERY_LIMIT),
      );

    return {
      companies: companiesWithAlumniCountPaginated,
      companyTotalCount: companyCount,
      alumniTotalCount: alumniCount,
    };
  }

  async getCompanyOptions(): Promise<CompanyOptionDto[]> {
    const companies = await this.companyRepository.findAll();

    return companies.map((company) => ({
      id: company.id,
      name: company.name,
    }));
  }

  async getIndustryWithCounts(
    query: QueryParamsDto,
  ): Promise<IndustryListResponseDto> {
    const industriesMap = new Map<
      string,
      { name: string; companyCount: number; alumniCount: number }
    >();

    const alumni = await this.alumniRepository.find(query);
    const companiesWithAlumniCount = this.getCompanyMap(alumni);

    companiesWithAlumniCount.forEach((company) => {
      const industryId = company.industryId;

      if (industryId && !industriesMap.has(industryId)) {
        industriesMap.set(industryId, {
          name: company.industry,
          companyCount: 0,
          alumniCount: 0,
        });
      }

      const industryData = industriesMap.get(industryId)!; // We just made sure it exists above, so we're gucci

      industryData.alumniCount += company.alumniCount;
      industryData.companyCount += 1;
    });

    const industries: IndustryListItemDto[] = Array.from(
      industriesMap.entries(),
    ).map(([industryId, data]) => ({
      id: industryId,
      name: data.name,
      companyCount: data.companyCount,
      alumniCount: data.alumniCount,
    }));

    const industriesOrdered = sortData(industries, {
      sortBy: query.sortBy || DEFAULT_QUERY_SORT_BY,
      direction: query.sortOrder || DEFAULT_QUERY_SORT_ORDER,
    }) as IndustryListItemDto[];

    const industriesPaginated = industriesOrdered.slice(
      query.offset || DEFAULT_QUERY_OFFSET,
      (query.offset || DEFAULT_QUERY_OFFSET) +
        (query.limit || DEFAULT_QUERY_LIMIT),
    );

    return {
      industries: industriesPaginated,
      total: industries.length,
    };
  }

  async getCompanyGrowth() {
    // TODO: Implement company growth calculation
    return Promise.resolve([]);
  }

  getCompanyMap(
    alumnus: AlumniAnalyticsEntity[],
  ): CompanyListItemExtendedDto[] {
    // Maps an alumni to a set of companies they've worked at
    const alumniCompanyMap = new Map<string, Set<string>>();
    const companiesWithAlumniCount: CompanyListItemExtendedDto[] = [];

    alumnus.forEach((alumnus) => {
      if (!alumniCompanyMap.has(alumnus.id)) {
        alumniCompanyMap.set(alumnus.id, new Set());
      }

      alumnus.roles.forEach((role) => {
        alumniCompanyMap.get(alumnus.id)!.add(role.company.id);
      });
    });

    const companyCountMap = new Map<string, number>();
    alumniCompanyMap.forEach((companySet) => {
      companySet.forEach((companyId) => {
        companyCountMap.set(
          companyId,
          (companyCountMap.get(companyId) || 0) + 1,
        );
      });
    });

    companyCountMap.forEach((count, companyId) => {
      const role = alumnus
        .flatMap((a) => a.roles)
        .find((r) => r.company.id === companyId);

      if (role) {
        companiesWithAlumniCount.push({
          id: companyId,
          name: role.company.name,
          alumniCount: count,
          logo: role.company.logo,
          industry: role.company.industry.name,
          industryId: role.company.industry.id,
        });
      }
    });

    return companiesWithAlumniCount;
  }
}
