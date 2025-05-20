import { PrismaService } from 'src/prisma/prisma.service';
import {
  AlumniPastLocationsAndCompaniesDto,
  BasicAlumniProfileDto,
  CompanyDto,
  ExtendedCompanyDto,
  GraduationDto,
} from '../dto/basic-alumni-profile.dto';
import { NotFoundException, Injectable } from '@nestjs/common';
import { LocationGeo, Role, Location } from '@/entities';
import { SENIORITY_LEVEL } from '@prisma/client';

@Injectable()
export class AlumniProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getBasicProfile(id: string): Promise<BasicAlumniProfileDto> {
    const alumni = await this.prisma.alumni.findUniqueOrThrow({
      where: { id },
      include: {
        Roles: {
          include: {
            Location: true,
            Company: true,
            JobClassification: {
              include: {
                EscoClassification: true,
              },
            },
          },
        },
        Graduations: true,
        Location: true,
      },
    });

    const currentRole = this.getCurrentOrLastRole(
      alumni.Roles as unknown as Role[],
    );
    let company: CompanyDto | null = null;
    let location: LocationGeo | null = null;
    if (currentRole) {
      const company_db = await this.prisma.company.findUnique({
        where: { id: currentRole.Company.id },
        include: {
          Industry: {
            select: {
              name: true,
            },
          },
        },
      });

      if (!company_db) {
        throw new NotFoundException('Company not found');
      }

      company = {
        id: company_db.id,
        name: company_db.name,
        industry: company_db.Industry.name,
        website: company_db.website,
        linkedinUrl: company_db.linkedinUrl,
        logo: company_db.logo,
      };

      location = currentRole.Location || alumni.Location || null;
    }

    const graduations: GraduationDto[] = [];
    for (const graduation of alumni.Graduations) {
      const course = await this.prisma.course.findUniqueOrThrow({
        where: { id: graduation.courseId },
      });

      const faculty = await this.prisma.faculty.findUniqueOrThrow({
        where: { id: course.facultyId },
      });

      const grad: GraduationDto = {
        conclusionYear: graduation.conclusionYear,
        acronym: course.acronym,
        facultyAcronym: faculty.acronym,
      };

      graduations.push(grad);
    }

    let title: string = 'No Current Role';
    if (currentRole) {
      const role_raw = await this.prisma.roleRaw.findUniqueOrThrow({
        where: { roleId: currentRole.id },
      });

      title = role_raw.title;
    }

    return {
      id: alumni.id,
      name: `${alumni.firstName} ${alumni.lastName}`,
      profilePictureUrl: alumni.profilePictureUrl,
      linkedinUrl: alumni.linkedinUrl,
      role: {
        title: title,
        startDate: currentRole?.startDate,
        endDate: currentRole?.endDate,
        confidence: currentRole?.JobClassification?.confidence,
        escoTitle: currentRole?.JobClassification?.EscoClassification.titleEn,
        escoCode: currentRole?.JobClassification?.EscoClassification.code,
        seniorityLevel: currentRole?.seniorityLevel as SENIORITY_LEVEL,
      },
      company: company,
      location: {
        city: location?.city,
        country: location?.country,
        countryCode: location?.countryCode,
      },
      graduations: graduations,
    };
  }

  /**
   * Get the current or last role of the alumni
   * @param roles - The roles of the alumni
   * @returns The current or last role of the alumni
   */
  getCurrentOrLastRole(roles: Role[]): Role | null {
    if (roles.length === 0) {
      return null;
    }

    const sortedRoles = roles.sort(
      (a, b) => b.startDate.getTime() - a.startDate.getTime(),
    );
    const currentRole = sortedRoles.find((role) => !role.endDate);

    return currentRole || sortedRoles[0];
  }

  async getPastLocationsAndCompanies(
    id: string,
  ): Promise<AlumniPastLocationsAndCompaniesDto> {
    const alumni = await this.prisma.alumni.findUniqueOrThrow({
      where: { id },
      include: {
        Roles: {
          include: {
            Location: true,
            Company: true,
            JobClassification: true,
          },
        },
        Graduations: true,
        Location: true,
      },
    });
  
    let companies: CompanyDto[] = [];
    let locations: Location[] = [];
 
    const uniqueCompanyIds = new Set<string>();
    const uniqueLocationIds = new Set<string>();

    alumni.Roles.forEach(async role => {

      if (role.Location) {
      const company : ExtendedCompanyDto = {
        id: role.Company.id,
        name: role.Company.name,
        industry: '',
        website: role.Company.website,
        linkedinUrl: role.Company.linkedinUrl,
        logo: role.Company.logo,
        location: role.Location,
      };

      const location = role.Location || alumni.Location || null;

      const combinedId = role.Company.id + location?.id;

      if (!uniqueCompanyIds.has(combinedId)) {
        uniqueCompanyIds.add(combinedId);
        companies.push(company);
      }

      if (location && !uniqueLocationIds.has(location.id)) {
        uniqueLocationIds.add(location.id);
        locations.push(location);
      }
    }
    });

    return {
      Companies: companies,
      Locations: locations,
    };
  }
}
