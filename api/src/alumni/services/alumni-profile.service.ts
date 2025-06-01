import { PrismaService } from 'src/prisma/prisma.service';
import {
  AlumniPastLocationsAndCompaniesDto,
  CompanyDto,
  ExtendedCompanyDto,
} from '../dto/alumni-profile.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Location } from '@/entities';
import { roleSelect } from '@/analytics/utils/selectors';
import { graduationSelect } from '@/analytics/utils/selectors';
import { AlumniAnalyticsEntity } from '@/analytics/entities/alumni.entity';
import { mapAlumniFromPrisma } from '@/analytics/utils/alumni.mapper';
import { RoleAnalyticsEntity } from '@/analytics/entities/role.entity';
import { mapRoleFromPrisma } from '@/analytics/utils/alumni.mapper';
import {
  EvaluateSeniorityLevelDto,
  EvaluateClassificationDto,
  UpdateClassificationDto,
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

  async evaluateSeniorityLevel(
    id: string,
    params: EvaluateSeniorityLevelDto,
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

  async evaluateJobClassification(
    id: string,
    params: EvaluateClassificationDto,
  ): Promise<RoleAnalyticsEntity> {
    const role = await this.prisma.role.findUniqueOrThrow({
      where: { id },
      select: roleSelect,
    });

    const classification = role.JobClassification;
    if (!classification) {
      throw new NotFoundException('Job classification not found');
    }

    await this.prisma.jobClassification.update({
      where: { roleId: id },
      data: { wasAcceptedByUser: params.wasAcceptedByUser },
    });

    // refetch the updated role
    const updatedRole = await this.prisma.role.findUniqueOrThrow({
      where: { id },
      select: roleSelect,
    });

    return mapRoleFromPrisma(updatedRole);
  }

  async updateJobClassification(
    id: string,
    params: UpdateClassificationDto,
  ): Promise<RoleAnalyticsEntity> {
    const { escoClassificationId } = params;

    // Get the role
    const role = await this.prisma.role.findUniqueOrThrow({
      where: { id },
      select: roleSelect,
    });

    console.log(role);

    // Get the current classification
    const classification = role.JobClassification;
    if (!classification) {
      throw new NotFoundException('Job classification not found');
    }

    // Update the classification to point to the new ESCO classification
    await this.prisma.role.update({
      where: { id },
      data: {
        JobClassification: {
          update: {
            where: { id: classification.escoClassificationId },
            data: {
              escoClassificationId,
              // We assume that if the user updates the classification, it was accepted by the user
              wasAcceptedByUser: true,
            },
          },
        },
      },
    });

    // Return the updated role
    return mapRoleFromPrisma(role);
  }
}
