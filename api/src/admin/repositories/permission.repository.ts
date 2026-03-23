import { Injectable, Logger } from '@nestjs/common';
import { Alumni, Permission } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

type UserSearchResult = Pick<Alumni, 'id' | 'fullName' | 'linkedinUrl'>;

@Injectable()
export class PermissionRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: Logger,
  ) {}

  async searchUsers(q: string): Promise<UserSearchResult[]> {
    return this.prisma.alumni.findMany({
      where: {
        fullName: { contains: q, mode: 'insensitive' },
      },
      select: { id: true, fullName: true, linkedinUrl: true },
      take: 20,
    });
  }

  async findByUser(userId: string): Promise<Permission[]> {
    return this.prisma.permission.findMany({
      where: { userId },
    });
  }

  async upsert(
    userId: string,
    resource: string,
    actions: string[],
  ): Promise<Permission> {
    const existing = await this.prisma.permission.findFirst({
      where: { userId, resource },
    });

    if (existing) {
      return this.prisma.permission.update({
        where: { id: existing.id },
        data: { actions },
      });
    }

    return this.prisma.permission.create({
      data: { userId, resource, actions },
    });
  }
}
