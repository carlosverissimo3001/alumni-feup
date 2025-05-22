import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async deleteUser(id: string): Promise<void> {
    // The onDelete cascade will remove all associated data
    // roles, graduations, review
    await this.prisma.alumni.delete({
      where: { id },
    });
  }
}
