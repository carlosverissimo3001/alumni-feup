import {
  COMPANY_SIZE,
  COMPANY_TYPE,
  COURSE_STATUS,
  COURSE_TYPE,
  SENIORITY_LEVEL,
  Prisma,
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
import { JobClassificationMetadataVo } from '../vos/job-classification.metadata.vo';
import { RoleMetadataVo } from '../vos/role-metadata.vo';

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
  metadata?: Prisma.JsonValue | null;
  modelUsed?: string | null;
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
  metadata?: Prisma.JsonValue | null;
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

/**
 * Maps the company from the prisma model to a TypeScript object
 * @param company - The company to map
 * @returns The mapped company
 */
export const mapCompanyFromPrisma = (
  company: RawCompany,
): CompanyAnalyticsEntity => {
  return {
    ...company,
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

/**
 * Maps the industry from the prisma model to a TypeScript object
 * @param industry - The industry to map
 * @returns The mapped industry
 */
const mapIndustryFromPrisma = (
  industry: RawIndustry,
): IndustryAnalyticsEntity => {
  return {
    ...industry,
  };
};

/**
 * Maps the esco classification from the prisma model to a TypeScript object
 * @param escoClassification - The esco classification to map
 * @returns The mapped esco classification
 */
export const mapEscoClassificationFromPrisma = (
  escoClassification: RawEscoClassification,
): EscoClassificationAnalyticsEntity => {
  return {
    ...escoClassification,
    escoUrl: escoClassification.escoUrl ?? undefined,
  };
};

/**
 * Maps the job classification from the prisma model to a TypeScript object
 * @param jobClassification - The job classification to map
 * @returns The mapped job classification
 */
export const mapJobClassificationFromPrisma = (
  jobClassification?: RawJobClassification | null,
): JobClassificationAnalyticsEntity | undefined => {
  if (!jobClassification || !jobClassification.EscoClassification)
    return undefined;

  const modelMetadata = jobClassification.metadata
    ? (jobClassification.metadata as Prisma.JsonObject)
    : undefined;

  const metadata = modelMetadata
    ? new JobClassificationMetadataVo({ ...modelMetadata })
    : undefined;

  return {
    roleId: jobClassification.roleId,
    escoClassification: mapEscoClassificationFromPrisma(
      jobClassification.EscoClassification,
    ),
    confidence: jobClassification.confidence ?? undefined,
    escoClassificationId: jobClassification.escoClassificationId,
    wasAcceptedByUser: jobClassification.wasAcceptedByUser ?? undefined,
    wasModifiedByUser: jobClassification.wasModifiedByUser ?? undefined,
    modelUsed: jobClassification.modelUsed ?? undefined,
    metadata,
  };
};

/**
 * Maps the location from the prisma model to a TypeScript object
 * @param location - The location to map
 * @returns The mapped location
 */
export const mapLocationFromPrisma = (
  location?: RawLocation | null,
): LocationAnalyticsEntity | undefined => {
  if (!location) return undefined;
  return {
    ...location,
    country: location.country ?? '',
    countryCode: location.countryCode ?? '',
    city: location.city ?? '',
    latitude: location.latitude ?? undefined,
    longitude: location.longitude ?? undefined,
  };
};

/**
 * Maps the role from the prisma model to a TypeScript object
 * @param role - The role to map
 * @returns The mapped role
 */
export const mapRoleFromPrisma = (role: RawRole): RoleAnalyticsEntity => {
  const modelMetadata = role.metadata
    ? (role.metadata as Prisma.JsonObject)
    : undefined;

  const metadata = modelMetadata
    ? new RoleMetadataVo({ ...modelMetadata })
    : undefined;

  return {
    id: role.id,
    alumniId: role.alumniId,
    startDate: role.startDate,
    isCurrent: role.isCurrent,
    metadata,
    seniorityLevel: role.seniorityLevel,
    endDate: role.endDate ?? undefined,
    jobClassification: mapJobClassificationFromPrisma(role.JobClassification),
    company: mapCompanyFromPrisma(role.Company),
    location: mapLocationFromPrisma(role.Location),
    wasSeniorityLevelAcceptedByUser:
      role.wasSeniorityLevelAcceptedByUser ?? undefined,
    wasSeniorityLevelModifiedByUser:
      role.wasSeniorityLevelModifiedByUser ?? undefined,
    roleRaw: mapRoleRawFromPrisma(role.RoleRaw),
  };
};

/**
 * Maps the role raw from the prisma model to a TypeScript object
 * @param roleRaw - The role raw to map
 * @returns The mapped role raw
 */
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
    ...graduation,
    course: mapCourseFromPrisma(graduation.Course),
  };
};

/**
 * Maps the course from the prisma model to a TypeScript object
 * @param course - The course to map
 * @returns The mapped course
 */
export const mapCourseFromPrisma = (
  course: RawCourse,
): CourseAnalyticsEntity => {
  return {
    ...course,
    facultyId: course.Faculty.id,
    faculty: mapFacultyFromPrisma(course.Faculty),
    facultyAcronym: course.Faculty.acronym,
    courseType: course.courseType,
    startYear: course.startYear,
    endYear: course.endYear ?? undefined,
  };
};

/**
 * Maps the faculty from the prisma model to a TypeScript object
 * @param faculty - The faculty to map
 * @returns The mapped faculty
 */
const mapFacultyFromPrisma = (faculty: RawFaculty): FacultyAnalyticsEntity => {
  return {
    ...faculty,
  };
};

/**
 * Maps the alumni from the prisma model to a TypeScript object
 * @param alumni - The alumni to map
 * @returns The mapped alumni
 */
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

