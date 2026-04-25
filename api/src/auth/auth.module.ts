import { Module } from '@nestjs/common';
import { UserAuthGuard } from './user-auth.guard';
import { SessionService } from './session.service';
import { LinkedinOAuthService } from './linkedin-oauth.service';
import { LinkedinOAuthController } from './linkedin-oauth.controller';
import { AuthController } from './auth.controller';
import { PrismaService } from '@/prisma/prisma.service';
import { UserModule } from '@/user/user.module';

@Module({
  imports: [UserModule],
  controllers: [LinkedinOAuthController, AuthController],
  providers: [
    UserAuthGuard,
    SessionService,
    LinkedinOAuthService,
    PrismaService,
  ],
  exports: [UserAuthGuard, SessionService],
})
export class AuthModule {}
