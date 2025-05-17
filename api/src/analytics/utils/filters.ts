import { AlumniAnalyticsEntity } from '../entities';
import { QueryParamsDto } from '../dto';

const shouldFilterAlumniWithoutRoles = (query: QueryParamsDto): boolean => {
  type ExcludedKeys =
    | 'alumniIds'
    | 'courseIds'
    | 'graduationYears'
    | 'limit'
    | 'offset'
    | 'sortBy'
    | 'sortOrder'
    | 'includeTrend';

  type FilterableQuery = Omit<QueryParamsDto, ExcludedKeys>;
  const filterableQuery = query as FilterableQuery;

  return Object.entries(filterableQuery).some((entry) => {
    const value = entry[1];
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    if (typeof value === 'string') {
      return value.trim() !== '';
    }
    if (typeof value === 'number') {
      return true;
    }
    if (typeof value === 'boolean') {
      return value;
    }
    return false;
  });
};

export const applyDateFilters = (
  data: AlumniAnalyticsEntity[],
  query: QueryParamsDto,
) => {
  const { startDate, endDate, currentRolesOnly } = query;

  return data
    .map((item) => {
      const filteredRoles = item.roles.filter((role) => {
        // If currentRolesOnly is true, only include roles that have no end date
        if (currentRolesOnly) {
          return role.endDate === null;
        }

        // If both dates are provided, filter roles that fall within the date range
        if (startDate && endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);
          const roleStart = new Date(role.startDate);
          const roleEnd = role.endDate ? new Date(role.endDate) : new Date();
          return roleStart >= start && roleEnd <= end;
        }

        // If only startDate is provided, filter roles that started after this date
        if (startDate) {
          const start = new Date(startDate);
          return new Date(role.startDate) >= start;
        }

        // If only endDate is provided, filter roles that ended before this date
        if (endDate) {
          const end = new Date(endDate);
          const roleEnd = role.endDate ? new Date(role.endDate) : new Date();
          return roleEnd <= end;
        }

        // If no date filters are provided, include all roles
        return true;
      });

      return {
        ...item,
        roles: filteredRoles,
      };
    })
    .filter((item) =>
      shouldFilterAlumniWithoutRoles(query) ? item.roles.length > 0 : true,
    );
};
