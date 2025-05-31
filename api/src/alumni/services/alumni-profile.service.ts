import { PrismaService } from 'src/prisma/prisma.service';
import {
  AlumniPastLocationsAndCompaniesDto,
  CompanyDto,
  ExtendedCompanyDto,
} from '../dto/alumni-profile.dto';
import { Injectable } from '@nestjs/common';
import { Location } from '@/entities';
import {
  jobClassificationSelect,
  roleSelect,
} from '@/analytics/utils/selectors';
import { graduationSelect } from '@/analytics/utils/selectors';
import { AlumniAnalyticsEntity } from '@/analytics/entities/alumni.entity';
import { mapAlumniFromPrisma } from '@/analytics/utils/alumni.mapper';
import { RoleAnalyticsEntity } from '@/analytics/entities/role.entity';
import {
  mapJobClassificationFromPrisma,
  mapRoleFromPrisma,
} from '@/analytics/utils/alumni.mapper';
import { JobClassificationAnalyticsEntity } from '@/analytics/entities';
import {
  SeniorityLevelAcceptedByUserDto,
  ClassificationAcceptedByUserDto,
} from '../dto';

@Injectable()
export class AlumniProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(id: string): Promise<AlumniAnalyticsEntity> {
    const alumni = await this.prisma.alumni.findUniqueOrThrow({
      where: { id },
      select: {
        id: true,
        fullName: true,
        linkedinUrl: true,
        profilePictureUrl: true,
        Roles: {
          select: roleSelect,
        },
        Graduations: {
          select: graduationSelect,
        },
      },
    });
    return mapAlumniFromPrisma(alumni);
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

    const companies: CompanyDto[] = [];
    const locations: Location[] = [];

    const uniqueCompanyIds = new Set<string>();
    const uniqueLocationIds = new Set<string>();

    alumni.Roles.forEach((role) => {
      if (role.Location) {
        const company: ExtendedCompanyDto = {
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

  async acceptSeniorityLevel(
    id: string,
    params: SeniorityLevelAcceptedByUserDto,
  ): Promise<RoleAnalyticsEntity> {
    const role = await this.prisma.role.findUniqueOrThrow({
      where: { id },
      select: roleSelect,
    });
    await this.prisma.role.update({
      where: { id },
      data: {
        wasSeniorityLevelAcceptedByUser: params.wasSeniorityLevelAcceptedByUser,
      },
    });
    return mapRoleFromPrisma(role);
  }

  async acceptJobClassification(
    id: string,
    params: ClassificationAcceptedByUserDto,
  ): Promise<JobClassificationAnalyticsEntity | null> {
    const classification =
      await this.prisma.jobClassification.findUniqueOrThrow({
        where: { id },
        select: jobClassificationSelect,
      });
    await this.prisma.jobClassification.update({
      where: { id },
      data: { wasAcceptedByUser: params.wasAcceptedByUser },
    });
    return mapJobClassificationFromPrisma(classification) ?? null;
  }
}
