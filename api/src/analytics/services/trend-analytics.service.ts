// Note: For brevity, we're only supporting trend analysis for the past 15 years
import { AlumniAnalyticsEntity, RoleAnalyticsEntity } from '../entities';
import { Frequency, TrendType } from '../utils/';
import { Injectable } from '@nestjs/common';
import { subYears } from 'date-fns';
import { DataPointDto } from '../dto';
import { getLabelForDate } from '../utils/date';

type getTrendParams = {
  data: AlumniAnalyticsEntity[];
  entityId: string;
  type?: TrendType;
};

const THIRTY_YEARS_AGO = subYears(new Date(), 30);

@Injectable()
export class TrendAnalyticsService {
  constructor() {}

  getCompanyTrend(params: getTrendParams): DataPointDto[] {
    const { data, entityId } = params;

    // Gets all the roles for the company that were active at any point in the last 30 years
    const roles = data
      .map((alumni) => alumni.roles)
      .flat()
      .filter((role) => role.company.id === entityId)
      .filter((role) => {
        const startDate = new Date(role.startDate);
        const endDate = role.endDate ? new Date(role.endDate) : null;
        return (
          startDate >= THIRTY_YEARS_AGO ||
          (endDate && endDate >= THIRTY_YEARS_AGO)
        );
      });

    // Generate quarterly data points for the last 15 years
    const dataPoints: DataPointDto[] = [];
    const now = new Date();
    let currentDate = new Date(THIRTY_YEARS_AGO);

    while (currentDate <= now) {
      // Count roles active in this month
      const activeRoles = roles.filter((role) => {
        const startDate = new Date(role.startDate);
        const endDate = role.endDate ? new Date(role.endDate) : null;
        return startDate <= currentDate && (!endDate || endDate >= currentDate);
      });

      dataPoints.push({
        // YYYY-QX
        label: getLabelForDate(currentDate, Frequency.MONTHLY),
        value: activeRoles.length,
      });

      // Move to next quarter
      currentDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        1,
      );
    }

    return dataPoints;
  }

  getCountryTrend(params: getTrendParams): DataPointDto[] {
    const { data, entityId } = params;

    // Gets all the roles whose location was the country
    const roles = data
      .map((alumni) => alumni.roles)
      .flat()
      .filter((role) => role.location?.countryCode === entityId)
      .filter((role) => {
        const startDate = new Date(role.startDate);
        const endDate = role.endDate ? new Date(role.endDate) : null;
        return (
          startDate >= THIRTY_YEARS_AGO ||
          (endDate && endDate >= THIRTY_YEARS_AGO)
        );
      });

    return this.aggregateActiveRoles(roles);
  }

  getCityTrend(params: getTrendParams): DataPointDto[] {
    const { data, entityId } = params;

    // Gets all the roles whose location was the city
    const roles = data
      .map((alumni) => alumni.roles)
      .flat()
      .filter((role) => role.location?.id === entityId)
      .filter((role) => {
        const startDate = new Date(role.startDate);
        const endDate = role.endDate ? new Date(role.endDate) : null;
        return (
          startDate >= THIRTY_YEARS_AGO ||
          (endDate && endDate >= THIRTY_YEARS_AGO)
        );
      });

    return this.aggregateActiveRoles(roles);
  }

  getRoleTrend(params: getTrendParams): DataPointDto[] {
    const { data, entityId } = params;

    // Gets all the roles whose title matches the entityId
    const roles = data
      .map((alumni) => alumni.roles)
      .flat()
      .filter(
        (role) => role.jobClassification?.escoClassification.code === entityId,
      )
      .filter((role) => {
        const startDate = new Date(role.startDate);
        const endDate = role.endDate ? new Date(role.endDate) : null;
        return (
          startDate >= THIRTY_YEARS_AGO ||
          (endDate && endDate >= THIRTY_YEARS_AGO)
        );
      });

    return this.aggregateActiveRoles(roles);
  }

  getIndustryTrend(params: getTrendParams): DataPointDto[] {
    const { data, entityId } = params;

    // Gets all the roles whose industry matches the entityId
    const roles = data
      .map((alumni) => alumni.roles)
      .flat()
      .filter((role) => role.company.industry.id === entityId)
      .filter((role) => {
        const startDate = new Date(role.startDate);
        const endDate = role.endDate ? new Date(role.endDate) : null;
        return (
          startDate >= THIRTY_YEARS_AGO ||
          (endDate && endDate >= THIRTY_YEARS_AGO)
        );
      });

    return this.aggregateActiveRoles(roles);
  }

  aggregateActiveRoles(roles: RoleAnalyticsEntity[]): DataPointDto[] {
    const dataPoints: DataPointDto[] = [];
    const now = new Date();
    let currentDate = new Date(THIRTY_YEARS_AGO);

    while (currentDate <= now) {
      // Count roles active in this month
      const activeRoles = roles.filter((role) => {
        const startDate = new Date(role.startDate);
        const endDate = role.endDate ? new Date(role.endDate) : null;
        return startDate <= currentDate && (!endDate || endDate >= currentDate);
      });

      dataPoints.push({
        label: getLabelForDate(currentDate, Frequency.MONTHLY),
        value: activeRoles.length,
      });

      // Move to next month
      currentDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        1,
      );
    }

    return dataPoints;
  }

  aggregateActiveCompanies(roles: RoleAnalyticsEntity[]): DataPointDto[] {
    const dataPoints: DataPointDto[] = [];
    const now = new Date();
    let currentDate = new Date(THIRTY_YEARS_AGO);

    while (currentDate <= now) {
      // Get unique companies active in this month
      const activeCompanies = new Set(
        roles
          .filter((role) => {
            const startDate = new Date(role.startDate);
            const endDate = role.endDate ? new Date(role.endDate) : null;
            return (
              startDate <= currentDate && (!endDate || endDate >= currentDate)
            );
          })
          .map((role) => role.company.id),
      );

      dataPoints.push({
        label: getLabelForDate(currentDate, Frequency.MONTHLY),
        value: activeCompanies.size,
      });

      // Move to next month
      currentDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        1,
      );
    }

    return dataPoints;
  }
}
