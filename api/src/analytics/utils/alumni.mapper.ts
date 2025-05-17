import { COMPANY_SIZE, COMPANY_TYPE, COURSE_STATUS } from '@prisma/client';
import {
  AlumniAnalyticsEntity,
  CompanyAnalyticsEntity,
  CourseAnalyticsEntity,
  FacultyAnalyticsEntity,
  IndustryAnalyticsEntity,
  JobClassificationAnalyticsEntity,
  LocationAnalyticsEntity,
  RoleAnalyticsEntity,
  GraduationAnalyticsEntity,
} from '../entities';

type RawJobClassification = {
  title: string;
  escoCode: string;
  level: number;
  confidence?: number | null;
};

type RawLocation = {
  id: string;
  country?: string | null;
  countryCode?: string | null;
  city?: string | null;
};

type RawRole = {
  id: string;
  alumniId: string;
  isCurrent: boolean;
  startDate: Date;
  endDate?: Date | null;
  Location?: RawLocation | null;
  JobClassification?: RawJobClassification | null;
  Company: {
    id: string;
    name: string;
    logo?: string | null;
    Industry: {
      id: string;
      name: string;
    };
    Location?: RawLocation | null;
  };
};

type RawAlumni = {
  id: string;
  fullName: string;
  linkedinUrl: string | null;
  profilePictureUrl: string | null;
  Roles: RawRole[];
  Graduations: RawGraduation[];
};

type RawCompany = {
  id: string;
  name: string;
  levelsFyiUrl?: string | null;
  logo?: string | null;
  Industry: RawIndustry;
  Location?: RawLocation | null;
  companySize?: COMPANY_SIZE | null;
  companyType?: COMPANY_TYPE | null;
};

type RawIndustry = {
  id: string;
  name: string;
};

type RawFaculty = {
  id: string;
  name: string;
  nameInt: string;
  acronym: string;
};

type RawCourse = {
  id: string;
  name: string;
  acronym: string;
  Faculty: RawFaculty;
  status: COURSE_STATUS;
};

type RawGraduation = {
  id: string;
  alumniId: string;
  courseId: string;
  conclusionYear: number;
  Course: RawCourse;
};

export function toAlumniAnalyticsEntity(
  alumni: RawAlumni,
): AlumniAnalyticsEntity {
  return {
    id: alumni.id,
    fullName: alumni.fullName,
    linkedinUrl: alumni.linkedinUrl,
    profilePictureUrl: alumni.profilePictureUrl,
    roles: alumni.Roles.map(mapRoleFromPrisma),
    graduations: alumni.Graduations.map(mapGraduationFromPrisma),
  };
}

export function toRoleAnalyticsEntity(
  role: Pick<RawRole, 'id' | 'startDate' | 'endDate' | 'alumniId'>,
): Partial<RoleAnalyticsEntity> {
  return {
    id: role.id,
    startDate: role.startDate,
    endDate: role.endDate,
    alumniId: role.alumniId,
  };
}

export function toCompanyAnalyticsEntity(
  company: RawCompany,
): CompanyAnalyticsEntity {
  return {
    id: company.id,
    name: company.name,
    logo: company.logo ?? undefined,
    companySize: company.companySize ?? undefined,
    companyType: company.companyType ?? undefined,
    levelsFyiUrl: company.levelsFyiUrl ?? undefined,
    industry: mapIndustryFromPrisma(company.Industry),
    location: mapLocationFromPrisma(company.Location),
  };
}

export const mapCompanyFromPrisma = (
  company: RawCompany,
): CompanyAnalyticsEntity => {
  return {
    id: company.id,
    name: company.name,
    logo: company.logo ?? undefined,
    levelsFyiUrl: company.levelsFyiUrl ?? undefined,
    industry: mapIndustryFromPrisma(company.Industry),
    location: mapLocationFromPrisma(company.Location),
    companySize: company.companySize ?? undefined,
    companyType: company.companyType ?? undefined,
  };
};

const mapIndustryFromPrisma = (
  industry: RawIndustry,
): IndustryAnalyticsEntity => {
  return {
    id: industry.id,
    name: industry.name,
  };
};

const mapJobClassificationFromPrisma = (
  jobClassification?: RawJobClassification | null,
): JobClassificationAnalyticsEntity | null => {
  if (!jobClassification) return null;
  return {
    escoCode: jobClassification.escoCode,
    name: jobClassification.title,
    level: jobClassification.level,
    confidence: jobClassification.confidence,
  };
};

const mapLocationFromPrisma = (
  location?: RawLocation | null,
): LocationAnalyticsEntity | undefined => {
  if (!location) return undefined;
  return {
    id: location.id,
    country: location.country ?? '',
    countryCode: location.countryCode ?? '',
    city: location.city ?? '',
  };
};

const mapRoleFromPrisma = (role: RawRole): RoleAnalyticsEntity => {
  return {
    id: role.id,
    alumniId: role.alumniId,
    startDate: role.startDate,
    endDate: role.endDate,
    isCurrent: role.isCurrent,
    jobClassification: mapJobClassificationFromPrisma(role.JobClassification),
    company: mapCompanyFromPrisma(role.Company),
    location: mapLocationFromPrisma(role.Location),
  };
};

const mapGraduationFromPrisma = (
  graduation: RawGraduation,
): GraduationAnalyticsEntity => {
  return {
    id: graduation.id,
    alumniId: graduation.alumniId,
    courseId: graduation.courseId,
    conclusionYear: graduation.conclusionYear,
    course: mapCourseFromPrisma(graduation.Course),
  };
};

export const mapCourseFromPrisma = (
  course: RawCourse,
): CourseAnalyticsEntity => {
  return {
    id: course.id,
    name: course.name,
    status: course.status,
    acronym: course.acronym,
    facultyId: course.Faculty.id,
    faculty: mapFacultyFromPrisma(course.Faculty),
    facultyAcronym: course.Faculty.acronym,
  };
};

const mapFacultyFromPrisma = (faculty: RawFaculty): FacultyAnalyticsEntity => {
  return {
    id: faculty.id,
    name: faculty.name,
    nameInt: faculty.nameInt,
    acronym: faculty.acronym,
  };
};
