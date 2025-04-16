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
} satisfies Prisma.AlumniSelect;
