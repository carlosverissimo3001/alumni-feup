import { Module } from '@nestjs/common';
import { UserAuthGuard } from './user-auth.guard';
import { SessionService } from './session.service';
import { PrismaService } from '@/prisma/prisma.service';

@Module({
  providers: [UserAuthGuard, SessionService, PrismaService],
  exports: [UserAuthGuard, SessionService],
})
export class AuthModule {}
