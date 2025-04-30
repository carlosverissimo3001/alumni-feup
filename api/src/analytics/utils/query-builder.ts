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
   * 1. Current roles only means roles whose endDate is null (here, we might be able to also use the startDate)
   * 2. If startDate and endDate are provided, we use them to filter roles, and, obv, ignore the currentRolesOnly filter
   */
  if (params.startDate && params.endDate) {
    // Both dates provided: find roles that started after startDate and ended before endDate
    roleAndClauses.push({
      startDate: { gte: new Date(params.startDate) },
      endDate: { lte: new Date(params.endDate) },
    });
  } else if (params.startDate) {
    // Only startDate: find roles that started after this date
    roleAndClauses.push({
      startDate: { gte: new Date(params.startDate) },
    });
  } else if (params.endDate) {
    // Only endDate: find roles that ended before this date
    roleAndClauses.push({
      endDate: { lte: new Date(params.endDate) },
    });
  } else if (params.currentRolesOnly) {
    roleAndClauses.push({ isCurrent: true });
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

  if (params.cityIds?.length) {
    roleAndClauses.push({
      Location: {
        id: { in: params.cityIds },
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
