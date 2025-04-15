import { Module } from '@nestjs/common';
import { AlumniService } from './services/alumni.service';
import { AlumniController } from './controllers/alumni.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AlumniRepository } from './repositories/alumni.repository';
import { Logger } from '@nestjs/common';
import { GeolocationService } from '../geolocation/geolocation.service';
import { AgentsApiService } from '../agents-api/agents-api.service';
import { OtpService } from '../otp/otp.service';
import { AlumniProfileService } from './services/alumni-profile.service';
@Module({
  controllers: [AlumniController],
  providers: [
    AlumniService,
    AlumniProfileService,
    PrismaService,
    AlumniRepository,
    Logger,
    GeolocationService,
    AgentsApiService,
    OtpService,
  ],
})
export class AlumniModule {}
