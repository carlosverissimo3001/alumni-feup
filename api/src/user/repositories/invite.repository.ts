import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Invite } from '@prisma/client';
import { InviteEntity } from '../entities/invite.entity';
import { FindInviteDto } from '../dto';
@Injectable()
export class InviteRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Finds an invite by email address
   * @param params - The parameters to search for
   * @returns The invite if found, null otherwise
   */
  async find(params: FindInviteDto): Promise<InviteEntity | null> {
    const invite = await this.prisma.invite.findFirst({
      where: {
        email: params.email,
        ...(params.used && { usedCount: { gt: 0 } }),
      },
    });
    return invite && this.fromPrismaObject(invite);
  }

  async incrementUsedCount(email: string): Promise<void> {
    await this.prisma.invite.update({
      where: { email },
      data: { usedCount: { increment: 1 } },
    });
  }

  async create(email: string): Promise<InviteEntity> {
    const invite = await this.prisma.invite.create({
      data: { email },
    });
    return this.fromPrismaObject(invite);
  }

  /**
   * Maps a Prisma Invite object to an InviteEntity
   * TODO: This will be used for handling nullable fields and custom mappings in the future
   */
  fromPrismaObject(prismaObject: Invite): InviteEntity {
    return {
      ...prismaObject,
    };
  }
}
