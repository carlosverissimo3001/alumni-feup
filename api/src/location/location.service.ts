import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Location } from '@prisma/client';

@Injectable()
export class LocationService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Location[]> {
    return this.prisma.location.findMany();
  }

  async delete(id: string): Promise<void> {
    await this.prisma.location.delete({ where: { id } });
  }

  async moveRoles(locationId: string, newLocationId: string): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.role.updateMany({
        where: { locationId },
        data: { locationId: newLocationId },
      }),

      this.prisma.alumni.updateMany({
        where: { currentLocationId: locationId },
        data: { currentLocationId: newLocationId },
      }),

      this.prisma.company.updateMany({
        where: { hqLocationId: locationId },
        data: { hqLocationId: newLocationId },
      }),
    ]);
  }

  async merge(sourceIds: string[], targetId: string): Promise<void> {
    const mergeSourceIds = [...new Set(sourceIds)].filter(
      (id) => id !== targetId,
    );

    if (mergeSourceIds.length === 0) {
      return;
    }

    await this.prisma.$transaction([
      this.prisma.role.updateMany({
        where: { locationId: { in: mergeSourceIds } },
        data: { locationId: targetId },
      }),
      this.prisma.alumni.updateMany({
        where: { currentLocationId: { in: mergeSourceIds } },
        data: { currentLocationId: targetId },
      }),
      this.prisma.company.updateMany({
        where: { hqLocationId: { in: mergeSourceIds } },
        data: { hqLocationId: targetId },
      }),
      this.prisma.location.deleteMany({
        where: { id: { in: mergeSourceIds } },
      }),
    ]);
  }
}
