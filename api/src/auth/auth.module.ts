import { Module } from '@nestjs/common';
import { UserAuthGuard } from './user-auth.guard';
import { PrismaService } from '@/prisma/prisma.service';

@Module({
  providers: [UserAuthGuard, PrismaService],
  exports: [UserAuthGuard],
})
export class AuthModule {}
