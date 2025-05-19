// Note: For brevity, we're only supporting trend analysis for the past 30 years
import {
  AlumniAnalyticsEntity,
  RoleAnalyticsEntity,
  GraduationAnalyticsEntity,
} from '../entities';
import { Frequency, TrendType } from '../utils/';
import { Injectable } from '@nestjs/common';
import { subYears } from 'date-fns';
import { DataPointDto } from '../dto';
import { getLabelForDate } from '../utils/date';

type TrendParams = {
  data: AlumniAnalyticsEntity[];
  entityId: string;
  type?: TrendType;
  isDifferentClassificationLevel?: boolean;
};

const THIRTY_YEARS_AGO = subYears(new Date(), 30);

@Injectable()
export class TrendAnalyticsService {
  constructor() {}

  getCompanyTrend(params: TrendParams): DataPointDto[] {
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

  getCountryTrend(params: TrendParams): DataPointDto[] {
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

  getCityTrend(params: TrendParams): DataPointDto[] {
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

  getRoleTrend(params: TrendParams): DataPointDto[] {
    const { data, entityId, isDifferentClassificationLevel } = params;

    // Gets all the roles whose title matches the entityId
    const roles = data
      .map((alumni) => alumni.roles)
      .flat()
      .filter((role) => {
        const jobClassification = role.jobClassification;
        const escoClassification = jobClassification?.escoClassification;

        // We classify against level 5 (e.g. 2512.1), but, if we're grouping
        // at level 3, we check for all roles starting with 251
        if (isDifferentClassificationLevel) {
          return escoClassification?.code.startsWith(entityId);
        }

        return escoClassification?.code === entityId;
      })
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

  getIndustryTrend(params: TrendParams): DataPointDto[] {
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

  getFacultyTrend(params: TrendParams): DataPointDto[] {
    const { data, entityId } = params;

    // Here, we get all the graduations from the faculty (the entity)
    const graduations = data
      .map((alumni) => alumni.graduations)
      .flat()
      .filter((graduation) => graduation.course.facultyId === entityId)
      .filter((graduation) => {
        const conclusionYearDate = new Date(graduation.conclusionYear, 0, 1);
        return (
          conclusionYearDate >= THIRTY_YEARS_AGO &&
          conclusionYearDate <= new Date()
        );
      });

    return this.aggregateActiveGraduations(graduations);
  }

  getMajorTrend(params: TrendParams): DataPointDto[] {
    const { data, entityId } = params;

    // Here, we get all the graduations from the major (the entity)
    const graduations = data
      .map((alumni) => alumni.graduations)
      .flat()
      .filter((graduation) => graduation.courseId === entityId)
      .filter((graduation) => {
        const conclusionYearDate = new Date(graduation.conclusionYear, 0, 1);
        return (
          conclusionYearDate >= THIRTY_YEARS_AGO &&
          conclusionYearDate <= new Date()
        );
      });

    return this.aggregateActiveGraduations(graduations);
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

  // Note: Naming is a bit weird, but essentially, here we aggregate the graduations
  // from a given faculty/course, per year, for the last 30 years
  aggregateActiveGraduations(
    graduations: GraduationAnalyticsEntity[],
  ): DataPointDto[] {
    const dataPoints: DataPointDto[] = [];
    const now = new Date();
    let currentDate = new Date(THIRTY_YEARS_AGO);

    while (currentDate <= now) {
      // Count graduations that happened in this specific year
      const activeGraduations = graduations.filter((graduation) => {
        return graduation.conclusionYear === currentDate.getFullYear();
      });

      dataPoints.push({
        label: getLabelForDate(currentDate, Frequency.YEARLY),
        value: activeGraduations.length,
      });

      // Move to next year
      currentDate = new Date(currentDate.getFullYear() + 1, 0, 1);
    }

    return dataPoints;
  }
}
