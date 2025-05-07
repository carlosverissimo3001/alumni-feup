import { companySelect } from '@/analytics/consts/company-select';
import { ReviewCompany } from '@/entities/reviewCompany.entity';
import { Prisma } from '@prisma/client';

export const locationSelect = {
  country: true,
  city: true,
  latitude: true,
  longitude: true,
} satisfies Prisma.LocationSelect;

export const graduationSelect = {
  conclusionYear: true,
  Course: {
    select: {
      id: true,
      name: true,
      acronym: true,
    },
  },
} satisfies Prisma.GraduationSelect;

export const roleSelect = {
  id: true,
  startDate: true,
  endDate: true,
  isCurrent: true,
  seniorityLevel: true,
  Company: {
    select: {
      id: true,
      name: true,
    },
  },
  Location: {
    select: locationSelect,
  },
  JobClassification: {
    select: {
      title: true,
      escoCode: true,
      level: true,
    },
  },
} satisfies Prisma.RoleSelect;

export const companySelectWithRoles = {
  id: true,
  name: true,
  roles: {
    select: roleSelect,
  },
} satisfies Prisma.CompanySelect;

export const reviewCompanySelect = {
  id: true,
  upvotes: true,
  downvotes: true,
  rating: true,
  description: true,
  createdAt: true,
  Company: {
    select: companySelectWithRoles,
  },
} satisfies Prisma.ReviewCompanySelect;

export const reviewLocationSelect = {
  id: true,
  upvotes: true,
  downvotes: true,
  rating: true,
  description: true,
  createdAt: true,
  Location: {
    select: locationSelect,
  },
} satisfies Prisma.ReviewLocationSelect;

export const alumniBasic = {
  id: true,
  firstName: true,
  lastName: true,
  fullName: true,
  linkedinUrl: true,
  profilePictureUrl: true,
} satisfies Prisma.AlumniSelect;

export const alumniSelect = {
  ...alumniBasic,
  Location: {
    select: locationSelect,
  },
  Graduations: {
    select: graduationSelect,
  },
  Roles: {
    select: roleSelect,
  },
  ReviewsCompany: {
    select: reviewCompanySelect,
  },
  ReviewsLocation: {
    select: reviewLocationSelect,
  },
} satisfies Prisma.AlumniSelect;
