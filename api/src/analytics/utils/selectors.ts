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
} satisfies Prisma.LocationSelect;

export const companySelect = {
  id: true,
  name: true,
  logo: true,
  levelsFyiUrl: true,
  companySize: true,
  companyType: true,
  Industry: {
    select: industrySelect,
  },
  Location: {
    select: locationSelect,
  },
} satisfies Prisma.CompanySelect;

export const jobClassificationSelect = {
  title: true,
  level: true,
  confidence: true,
  escoCode: true,
} satisfies Prisma.JobClassificationSelect;

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

export const facultySelect = {
  id: true,
  name: true,
  nameInt: true,
  acronym: true,
} satisfies Prisma.FacultySelect;

export const courseSelect = {
  id: true,
  name: true,
  acronym: true,
  status: true,
  Faculty: {
    select: facultySelect,
  },
} satisfies Prisma.CourseSelect;

export const graduationSelect = {
  id: true,
  alumniId: true,
  courseId: true,
  Course: {
    select: courseSelect,
  },
  conclusionYear: true,
} satisfies Prisma.GraduationSelect;
