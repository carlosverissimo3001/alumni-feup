import { EmailService } from '@/email/services/email.service';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { OtpService } from '../otp/otp.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserController } from './controllers/user.controller';
import { InviteRepository, UserRepository } from './repositories';
import { UserService } from './services/user.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET') || 'your-secret-key',
        signOptions: { expiresIn: configService.get('JWT_EXPIRATION') || '1d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    PrismaService,
    Logger,
    OtpService,
    EmailService,
    UserRepository,
    InviteRepository,
  ],
})
export class UserModule {}
