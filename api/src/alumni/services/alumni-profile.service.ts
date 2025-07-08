import { PrismaService } from 'src/prisma/prisma.service';
import {
  AlumniPastLocationsAndCompaniesDto,
  CompanyDto,
  ExtendedCompanyDto,
} from '../dto/alumni-profile.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Location } from '@/entities';
import { locationSelect, roleSelect } from '@/analytics/utils/selectors';
import { graduationSelect } from '@/analytics/utils/selectors';
import { AlumniAnalyticsEntity } from '@/analytics/entities/alumni.entity';
import { mapAlumniFromPrisma } from '@/analytics/utils/mapper';
import { RoleAnalyticsEntity } from '@/analytics/entities/role.entity';
import { mapRoleFromPrisma } from '@/analytics/utils/mapper';
import {
  EvaluateSeniorityLevelDto,
  EvaluateClassificationDto,
  UpdateClassificationDto,
  UpdateSeniorityLevelDto,
  UpdateRoleVisibilityDto,
} from '../dto';
import { AgentsApiService } from '@/agents-api/services/agents-api.service';
import { LINKEDIN_OPERATION } from '@/consts';

@Injectable()
export class AlumniProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly agentsApiService: AgentsApiService,
  ) {}

  async getProfile(id: string): Promise<AlumniAnalyticsEntity> {
    const alumni = await this.prisma.alumni.findUniqueOrThrow({
      where: { id },
      select: {
        id: true,
        fullName: true,
        linkedinUrl: true,
        profilePictureUrl: true,
        updatedAt: true,
        Roles: {
          select: roleSelect,
        },
        Graduations: {
          select: graduationSelect,
        },
        Location: {
          select: locationSelect,
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

    // Get the current classification
    const classification = role.JobClassification;
    if (!classification) {
      throw new NotFoundException('Job classification not found');
    }

    // Update the classification to point to the new ESCO classification
    await this.prisma.jobClassification.update({
      where: { id: classification.id },
      data: {
        escoClassificationId,
        wasModifiedByUser: true,
      },
    });

    // Refetch the updated classification

    // refetch the updated role
    const updatedRole = await this.prisma.role.findUniqueOrThrow({
      where: { id },
      select: roleSelect,
    });

    // Return the updated role
    return mapRoleFromPrisma(updatedRole);
  }

  async updateSeniorityLevel(
    id: string,
    params: UpdateSeniorityLevelDto,
  ): Promise<RoleAnalyticsEntity> {
    const { seniorityLevel } = params;

    const updatedRole = await this.prisma.role.update({
      select: roleSelect,
      where: { id },
      data: {
        seniorityLevel,
        wasSeniorityLevelModifiedByUser: true,
      },
    });
    return mapRoleFromPrisma(updatedRole);
  }

  /**
   * Triggers a LinkedIn operation to update the data for an alumni
   * @param id - The ID of the alumni to update
   * @returns A success message, as the update is triggered asynchronously
   */
  async requestDataUpdate(id: string): Promise<string> {
    await this.agentsApiService.triggerLinkedinOperation(
      LINKEDIN_OPERATION.UPDATE,
      [id],
    );
    return 'Data update requested';
  }

  /**
   * Deletes an alumni
   * @param id - The ID of the alumni to delete
   * @returns A success message, as the alumni is deleted asynchronously
   */
  async delete(id: string): Promise<string> {
    await this.prisma.alumni.delete({
      where: { id },
    });
    return 'Alumni deleted';
  }

  /**
   * Updates the visibility of a role in the user profile
   * @param id - The ID of the role to update
   * @param params - The parameters to update the role visibility
   * @returns The updated role
   */
  async updateRoleVisibility(
    params: UpdateRoleVisibilityDto,
  ): Promise<RoleAnalyticsEntity> {
    const { id, shouldHide } = params;

    const role = await this.prisma.role.update({
      where: { id },
      data: { isHiddenInProfile: shouldHide },
      select: roleSelect,
    });

    return mapRoleFromPrisma(role);
  }

  /**
   * Marks a role as the main role of the user
   * @param id - The ID of the role to mark as main
   * @returns The updated role
   */
  async markAsMainRole(id: string): Promise<RoleAnalyticsEntity> {
    // Find the current main role
    const currentMainRole = await this.prisma.role.findFirst({
      where: { isMainRole: true },
    });

    if (currentMainRole) {
      await this.prisma.role.update({
        where: { id: currentMainRole.id },
        data: { isMainRole: false },
      });
    }

    const role = await this.prisma.role.update({
      where: { id },
      data: { isMainRole: true },
      select: roleSelect,
    });
    return mapRoleFromPrisma(role);
  }
}
