import { Prisma } from '@prisma/client';

export const roleRawSelect = {
  title: true,
} satisfies Prisma.RoleRawSelect;

export const industrySelect = {
  id: true,
  name: true,
} satisfies Prisma.IndustrySelect;

export const locationSelect = {
  id: true,
  country: true,
  countryCode: true,
  city: true,
  latitude: true,
  longitude: true,
} satisfies Prisma.LocationSelect;

export const companySelect = {
  id: true,
  name: true,
  logo: true,
  levelsFyiUrl: true,
  website: true,
  linkedinUrl: true,
  companySize: true,
  companyType: true,
  Industry: {
    select: industrySelect,
  },
  Location: {
    select: locationSelect,
  },
} satisfies Prisma.CompanySelect;

export const escoClassificationSelect = {
  titleEn: true,
  code: true,
  isLeaf: true,
  level: true,
  escoUrl: true,
} satisfies Prisma.EscoClassificationSelect;

export const jobClassificationSelect = {
  roleId: true,
  escoClassificationId: true,
  confidence: true,
  EscoClassification: {
    select: escoClassificationSelect,
  },
  wasAcceptedByUser: true,
} satisfies Prisma.JobClassificationSelect;

export const roleSelect = {
  id: true,
  alumniId: true,
  startDate: true,
  endDate: true,
  isCurrent: true,
  seniorityLevel: true,
  wasSeniorityLevelAcceptedByUser: true,
  Location: {
    select: locationSelect,
  },
  Company: {
    select: companySelect,
  },
  JobClassification: {
    select: jobClassificationSelect,
  },
  RoleRaw: {
    select: roleRawSelect,
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
  startYear: true,
  endYear: true,
  courseType: true,
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
