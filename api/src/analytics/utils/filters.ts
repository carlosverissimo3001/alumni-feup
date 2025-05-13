import { AlumniAnalyticsEntity } from '../entities';
import { QueryParamsDto } from '../dto';

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
    .filter((item) => item.roles.length > 0);
};
