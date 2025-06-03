import {
  COMPANY_SIZE,
  COMPANY_TYPE,
  COURSE_STATUS,
  COURSE_TYPE,
  SENIORITY_LEVEL,
} from '@prisma/client';
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
  RoleRawAnalyticsEntity,
} from '../entities';
import { EscoClassificationAnalyticsEntity } from '../entities/esco-classification.entity';

// What a name lol
type RawRoleRaw = {
  title: string;
};

type RawEscoClassification = {
  titleEn: string;
  code: string;
  isLeaf: boolean;
  level: number;
  escoUrl?: string | null;
};

type RawJobClassification = {
  roleId: string;
  escoClassificationId: string;
  confidence?: number | null;
  EscoClassification: RawEscoClassification;
  wasAcceptedByUser?: boolean | null;
  wasModifiedByUser?: boolean | null;
};

type RawRole = {
  id: string;
  alumniId: string;
  isCurrent: boolean;
  startDate: Date;
  endDate?: Date | null;
  seniorityLevel: SENIORITY_LEVEL;
  Location?: RawLocation | null;
  JobClassification?: RawJobClassification | null;
  Company: RawCompany;
  wasSeniorityLevelAcceptedByUser?: boolean | null;
  wasSeniorityLevelModifiedByUser?: boolean | null;
  RoleRaw: RawRoleRaw | null;
};

type RawLocation = {
  id: string;
  country?: string | null;
  countryCode?: string | null;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

type RawAlumni = {
  id: string;
  fullName: string;
  linkedinUrl: string | null;
  profilePictureUrl: string | null;
  Roles: RawRole[];
  Graduations: RawGraduation[];
  Location?: RawLocation | null;
};

type RawCompany = {
  id: string;
  name: string;
  levelsFyiUrl?: string | null;
  logo?: string | null;
  linkedinUrl?: string | null;
  website?: string | null;
  founded?: number | null;
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
  courseType: COURSE_TYPE;
  startYear: number;
  endYear?: number | null;
};

type RawGraduation = {
  id: string;
  alumniId: string;
  courseId: string;
  conclusionYear: number;
  Course: RawCourse;
};

export const mapCompanyFromPrisma = (
  company: RawCompany,
): CompanyAnalyticsEntity => {
  return {
    id: company.id,
    name: company.name,
    logo: company.logo ?? undefined,
    linkedinUrl: company.linkedinUrl ?? undefined,
    founded: company.founded ?? undefined,
    levelsFyiUrl: company.levelsFyiUrl ?? undefined,
    industry: mapIndustryFromPrisma(company.Industry),
    location: mapLocationFromPrisma(company.Location),
    companySize: company.companySize ?? undefined,
    companyType: company.companyType ?? undefined,
    website: company.website ?? undefined,
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

export const mapEscoClassificationFromPrisma = (
  escoClassification: RawEscoClassification,
): EscoClassificationAnalyticsEntity => {
  return {
    titleEn: escoClassification.titleEn,
    code: escoClassification.code,
    level: escoClassification.level,
    isLeaf: escoClassification.isLeaf,
    escoUrl: escoClassification.escoUrl ?? undefined,
  };
};

export const mapJobClassificationFromPrisma = (
  jobClassification?: RawJobClassification | null,
): JobClassificationAnalyticsEntity | undefined => {
  if (!jobClassification || !jobClassification.EscoClassification)
    return undefined;
  return {
    escoClassificationId: jobClassification.escoClassificationId,
    roleId: jobClassification.roleId,
    confidence: jobClassification.confidence,
    escoClassification: mapEscoClassificationFromPrisma(
      jobClassification.EscoClassification,
    ),
    wasAcceptedByUser: jobClassification.wasAcceptedByUser ?? undefined,
    wasModifiedByUser: jobClassification.wasModifiedByUser ?? undefined,
  };
};

export const mapLocationFromPrisma = (
  location?: RawLocation | null,
): LocationAnalyticsEntity | undefined => {
  if (!location) return undefined;
  return {
    id: location.id,
    country: location.country ?? '',
    countryCode: location.countryCode ?? '',
    city: location.city ?? '',
    latitude: location.latitude ?? undefined,
    longitude: location.longitude ?? undefined,
  };
};

export const mapRoleFromPrisma = (role: RawRole): RoleAnalyticsEntity => {
  return {
    id: role.id,
    alumniId: role.alumniId,
    startDate: role.startDate,
    endDate: role.endDate ?? undefined,
    isCurrent: role.isCurrent,
    jobClassification: mapJobClassificationFromPrisma(role.JobClassification),
    company: mapCompanyFromPrisma(role.Company),
    location: mapLocationFromPrisma(role.Location),
    seniorityLevel: role.seniorityLevel,
    wasSeniorityLevelAcceptedByUser:
      role.wasSeniorityLevelAcceptedByUser ?? undefined,
    wasSeniorityLevelModifiedByUser:
      role.wasSeniorityLevelModifiedByUser ?? undefined,
    roleRaw: mapRoleRawFromPrisma(role.RoleRaw),
  };
};

export const mapRoleRawFromPrisma = (
  roleRaw?: RawRoleRaw | null,
): RoleRawAnalyticsEntity | undefined => {
  if (!roleRaw) return undefined;
  return {
    title: roleRaw.title,
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
    courseType: course.courseType,
    startYear: course.startYear,
    endYear: course.endYear ?? undefined,
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

export const mapAlumniFromPrisma = (
  alumni: RawAlumni,
): AlumniAnalyticsEntity => {
  return {
    id: alumni.id,
    fullName: alumni.fullName,
    linkedinUrl: alumni.linkedinUrl ?? undefined,
    profilePictureUrl: alumni.profilePictureUrl ?? undefined,
    roles: alumni.Roles.map(mapRoleFromPrisma),
    graduations: alumni.Graduations.map(mapGraduationFromPrisma),
    location: mapLocationFromPrisma(alumni.Location),
  };
};
