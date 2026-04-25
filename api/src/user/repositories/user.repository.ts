import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Alumni, Prisma } from '@prisma/client';
import { User } from '../dto/user.dto';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async update(id: string, data: Prisma.AlumniUpdateInput): Promise<Alumni> {
    return this.prisma.alumni.update({ where: { id }, data });
  }

  async deleteUser(id: string): Promise<void> {
    // The onDelete cascade will remove all associated data
    // roles, graduations, review
    await this.prisma.alumni.delete({
      where: { id },
    });
  }

  // Maps DB object to DTO (Note, I'd prefer this to be an entity instead of a dto)
  fromPrismaObject(alumni: Alumni): User {
    return {
      ...alumni,
      profilePictureUrl: alumni.profilePictureUrl ?? undefined,
    };
  }
}
