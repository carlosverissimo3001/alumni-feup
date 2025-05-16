import { Prisma } from '@prisma/client';

export const industrySelect = {
  id: true,
  name: true,
} satisfies Prisma.IndustrySelect;

export const locationSelect = {
  id: true,
  country: true,
  countryCode: true,
  city: true,
};

export const companySelect = {
  id: true,
  name: true,
  logo: true,
  levelsFyiUrl: true,
  Industry: {
    select: industrySelect,
  },
  Location: {
    select: locationSelect,
  },
};

export const jobClassificationSelect = {
  title: true,
  level: true,
  confidence: true,
  escoCode: true,
};

export const roleSelect = {
  id: true,
  alumniId: true,
  startDate: true,
  endDate: true,
  isCurrent: true,
  Location: {
    select: locationSelect,
  },
  Company: {
    select: companySelect,
  },
  JobClassification: {
    select: jobClassificationSelect,
  },
} satisfies Prisma.RoleSelect;
