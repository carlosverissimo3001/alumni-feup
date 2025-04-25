import { QueryParamsDto } from '../dto';
import { Prisma } from '@prisma/client';
import { EXCLUDED_INDUSTRIES, PORTUGAL_COUNTRY_CODE } from './consts';

export const buildWhereClause = (
  params: QueryParamsDto,
): {
  alumniWhere: Prisma.AlumniWhereInput;
  roleWhere?: Prisma.RoleWhereInput;
} => {
  const alumniAndClauses: Prisma.AlumniWhereInput[] = [];
  const roleAndClauses: Prisma.RoleWhereInput[] = [];

  if (params.courseIds?.length || params.graduationYears?.length) {
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
          ],
        },
      },
    });
  }

  /**
   * Role-specific filters
   */
  if (params.currentRolesOnly) {
    roleAndClauses.push({ isCurrent: true });
  } else if (params.startDate || params.endDate) {
    roleAndClauses.push({
      startDate: {
        ...(params.startDate && { gte: new Date(params.startDate) }),
        ...(params.endDate && { lte: new Date(params.endDate) }),
      },
    });
  }

  if (params.onlyInternational) {
    roleAndClauses.push({
      Location: {
        countryCode: { notIn: [PORTUGAL_COUNTRY_CODE] },
      },
    });
  }

  if (params.countries?.length) {
    roleAndClauses.push({
      Location: {
        countryCode: { in: params.countries },
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

  if (params.companySearch?.trim()) {
    roleAndClauses.push({
      Company: {
        name: { contains: params.companySearch, mode: 'insensitive' },
      },
    });
  }

  if (params.industrySearch?.trim()) {
    roleAndClauses.push({
      Company: {
        Industry: {
          name: { contains: params.industrySearch, mode: 'insensitive' },
        },
      },
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
