import { QueryParamsDto } from '../dto';
import { Prisma } from '@prisma/client';
import { EXCLUDED_INDUSTRIES, PORTUGAL_COUNTRY_CODE } from '../consts';

const normalizeText = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

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

  if (params.escoCodes?.length) {
    roleAndClauses.push({
      JobClassification: {
        EscoClassification: {
          OR: params.escoCodes.map((code) => ({
            code: { startsWith: code },
          })),
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

  if (params.seniorityLevel?.length) {
    roleAndClauses.push({
      seniorityLevel: { in: params.seniorityLevel },
    });
  }

  // Alumni search
  if (params.alumniSearch?.trim()) {
    const searchTerms = normalizeText(params.alumniSearch)
      .split(/\s+/)
      .filter(Boolean);

    alumniAndClauses.push({
      AND: searchTerms.map((term) => ({
        OR: [
          { fullName: { contains: term, mode: 'insensitive' } },
          { firstName: { contains: term, mode: 'insensitive' } },
          { lastName: { contains: term, mode: 'insensitive' } },
        ],
      })),
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
