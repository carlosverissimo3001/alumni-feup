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
      courseType: true,
      startYear: true,
    },
  },
} satisfies Prisma.GraduationSelect;

export const escoClassificationSelect = {
  id: true,
  titleEn: true,
  code: true,
  isLeaf: true,
  level: true,
} satisfies Prisma.EscoClassificationSelect;

export const jobClassificationSelect = {
  id: true,
  roleId: true,
  escoClassificationId: true,
  confidence: true,
  EscoClassification: {
    select: escoClassificationSelect,
  },
} satisfies Prisma.JobClassificationSelect;

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
    select: jobClassificationSelect,
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
  anonymous: true,
  Company: {
    select: companySelectWithRoles,
  },
  Location: {
    select: locationSelect,
  },
} satisfies Prisma.ReviewCompanySelect;

export const reviewLocationSelect = {
  id: true,
  upvotes: true,
  downvotes: true,
  rating: true,
  description: true,
  createdAt: true,
  anonymous: true,
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

export const alumniSelectOnlyCompany = {
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
} satisfies Prisma.AlumniSelect;

export const alumniSelectOnlyLocation = {
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
  ReviewsLocation: {
    select: reviewLocationSelect,
  },
} satisfies Prisma.AlumniSelect;
