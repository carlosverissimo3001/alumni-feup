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
    await Promise.all([
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
}
