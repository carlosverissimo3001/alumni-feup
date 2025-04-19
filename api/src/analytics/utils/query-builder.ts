import { QueryParamsDto } from '../dto';
import { Prisma } from '@prisma/client';

export const buildWhereClause = (
  params: QueryParamsDto,
): {
  companyWhere: Prisma.CompanyWhereInput;
  roleWhere?: Prisma.RoleWhereInput;
} => {
  const companyAndClauses: Prisma.CompanyWhereInput[] = [];
  const roleAndClauses: Prisma.RoleWhereInput[] = [];

  if (params.industryIds?.length) {
    companyAndClauses.push({
      industryId: { in: params.industryIds },
    });
  }

  if (params.companyIds?.length) {
    companyAndClauses.push({
      id: { in: params.companyIds },
    });
  }

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

  if (params.locationIds?.length) {
    roleAndClauses.push({
      locationId: { in: params.locationIds },
    });
  }

  if (params.countries?.length) {
    roleAndClauses.push({
      Location: {
        country: { in: params.countries },
      },
    });
  }

  if (params.courseIds?.length || params.graduationYears?.length) {
    roleAndClauses.push({
      Alumni: {
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
      },
    });
  }

  if (roleAndClauses.length > 0) {
    companyAndClauses.push({
      Role: {
        some: {
          AND: roleAndClauses,
        },
      },
    });
  }

  // Note(Carlos V.): Is there a better way to do this?
  if (params.search?.trim()) {
    /* For now, let's assume the search is a company name */
    /* Later, we'll make this generice enough to apply to
        - coutry/city
        - industry
        - company name
        - course name
        - alumni name
        ...
      */
    companyAndClauses.push({
      AND: [{ name: { contains: params.search, mode: 'insensitive' } }],
    });
  }

  return {
    companyWhere:
      companyAndClauses.length > 0 ? { AND: companyAndClauses } : {},
    roleWhere: roleAndClauses.length > 0 ? { AND: roleAndClauses } : undefined,
  };
};
