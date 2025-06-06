import { Prisma } from '@prisma/client';
import { AnalyticsSelect } from '../repositories/alumni.repository';

// Base selectors for commonly used fields
const baseLocationSelect = {
  id: true,
  city: true,
  country: true,
  countryCode: true,
  latitude: true,
  longitude: true,
} satisfies Prisma.LocationSelect;

// Education analytics only needs graduation data
export const educationAnalyticsSelect: AnalyticsSelect = {
  includeGraduations: true,
  graduationSelect: {
    conclusionYear: true,
    Course: {
      select: {
        id: true,
        name: true,
        Faculty: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    },
  },
};

// Geo analytics needs location data from roles
export const geoAnalyticsSelect: AnalyticsSelect = {
  includeRoles: true,
  roleSelect: {
    id: true,
    startDate: true,
    endDate: true,
    isCurrent: true,
    Location: {
      select: baseLocationSelect,
    },
  },
};

// Company analytics only needs company data from roles
export const companyAnalyticsSelect: AnalyticsSelect = {
  includeRoles: true,
  roleSelect: {
    id: true,
    alumniId: true,
    startDate: true,
    endDate: true,
    isCurrent: true,
    Company: {
      select: {
        id: true,
        name: true,
        logo: true,
        levelsFyiUrl: true,
        Industry: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    },
  },
};

// Role analytics needs job classification data
export const roleAnalyticsSelect: AnalyticsSelect = {
  includeRoles: true,
  roleSelect: {
    id: true,
    startDate: true,
    endDate: true,
    isCurrent: true,
    seniorityLevel: true,
    JobClassification: {
      select: {
        id: true,
        EscoClassification: {
          select: {
            id: true,
            code: true,
            titleEn: true,
            level: true,
            escoUrl: true,
          },
        },
      },
    },
  },
};

// Seniority analytics only needs seniority data
export const seniorityAnalyticsSelect: AnalyticsSelect = {
  includeRoles: true,
  roleSelect: {
    id: true,
    startDate: true,
    endDate: true,
    isCurrent: true,
    seniorityLevel: true,
  },
};
