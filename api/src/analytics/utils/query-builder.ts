import { QueryParamsDto } from '../dto';
import { Prisma } from '@prisma/client';
import { EXCLUDED_INDUSTRIES, PORTUGAL_COUNTRY_CODE } from './consts';

const normalizeText = (text: string) => {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

export const buildWhereClause = (
  params: QueryParamsDto,
): {
  alumniWhere: Prisma.AlumniWhereInput;
  roleWhere?: Prisma.RoleWhereInput;
} => {
  const alumniAndClauses: Prisma.AlumniWhereInput[] = [];
  const roleAndClauses: Prisma.RoleWhereInput[] = [];

  if (
    params.courseIds?.length ||
    params.graduationYears?.length ||
    params.facultyIds?.length
  ) {
    alumniAndClauses.push({
      Graduations: {
        some: {
          AND: [
            ...(params.courseIds?.length
              ? [{ courseId: { in: params.courseIds } }]
              : []),
            ...(params.graduationYears?.length
              ? [
                  {
                    conclusionYear: {
                      in: params.graduationYears.map(Number),
                    },
                  },
                ]
              : []),
            ...(params.facultyIds?.length
              ? [{ Course: { facultyId: { in: params.facultyIds } } }]
              : []),
          ],
        } satisfies Prisma.GraduationWhereInput,
      },
    });
  }

  if (params.alumniIds?.length) {
    alumniAndClauses.push({
      id: { in: params.alumniIds },
    });
  }

  if (params.onlyInternational) {
    roleAndClauses.push({
      Location: {
        countryCode: { notIn: [PORTUGAL_COUNTRY_CODE] },
      },
    });
  }

  if (params.onlyCompaniesWithSalaryData) {
    roleAndClauses.push({
      Company: {
        levelsFyiUrl: { not: null },
      },
    });
  }

  // TODO: Right now, its a 1-1 mapping between role and job classification.
  // Later, we will have 2 classifications for each role: level 1 is the more general one,
  // and level 2 is the more specific one.
  if (params.escoCodes?.length) {
    roleAndClauses.push({
      JobClassification: {
        EscoClassification: {
          code: { in: params.escoCodes },
        },
      },
    });
  }

  if (params.roleCountryCodes?.length) {
    roleAndClauses.push({
      Location: {
        countryCode: { in: params.roleCountryCodes },
      },
    });
  }

  if (params.roleCityIds?.length) {
    roleAndClauses.push({
      Location: {
        id: { in: params.roleCityIds },
      },
    });
  }

  if (params.companyHQsCountryCodes?.length) {
    roleAndClauses.push({
      Company: {
        Location: { countryCode: { in: params.companyHQsCountryCodes } },
      },
    });
  }

  if (params.companyHQsCityIds?.length) {
    roleAndClauses.push({
      Company: {
        Location: { id: { in: params.companyHQsCityIds } },
      },
    });
  }

  // Company-specific filters
  if (params.industryIds?.length) {
    roleAndClauses.push({
      Company: {
        industryId: { in: params.industryIds },
      },
    });
  }

  if (params.companySize) {
    roleAndClauses.push({
      Company: {
        companySize: { in: params.companySize },
      },
    });
  }

  if (params.companyType) {
    roleAndClauses.push({
      Company: {
        companyType: { in: params.companyType },
      },
    });
  }

  if (params.excludeResearchAndHighEducation) {
    roleAndClauses.push({
      Company: {
        Industry: {
          id: { notIn: EXCLUDED_INDUSTRIES },
        },
      },
    });
  }

  if (params.companyIds?.length) {
    roleAndClauses.push({
      companyId: { in: params.companyIds },
    });
  }

  if (params.alumniSearch?.trim()) {
    const searchTerm = normalizeText(params.alumniSearch.trim());
    roleAndClauses.push({
      Alumni: {
        fullName: { contains: searchTerm, mode: 'insensitive' },
      },
    });
  }

  // Broader search
  if (params.search?.trim()) {
    const searchTerm = normalizeText(params.search.trim());
    alumniAndClauses.push({
      OR: [
        {
          fullName: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          Roles: {
            some: {
              Company: {
                name: { contains: searchTerm, mode: 'insensitive' },
              },
              isCurrent: true,
            },
          },
        },
      ],
    });
  }

  // If we have any role filters, apply them to alumni through Roles
  if (roleAndClauses.length > 0) {
    alumniAndClauses.push({
      Roles: {
        some: {
          AND: roleAndClauses,
        },
      },
    });
  }

  return {
    alumniWhere: alumniAndClauses.length > 0 ? { AND: alumniAndClauses } : {},
    roleWhere: roleAndClauses.length > 0 ? { AND: roleAndClauses } : undefined,
  };
};
