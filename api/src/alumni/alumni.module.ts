import { Logger, Module } from '@nestjs/common';
import { AgentsApiService } from '../agents-api/agents-api.service';
import { GeolocationService } from '../geolocation/geolocation.service';
import { OtpService } from '../otp/otp.service';
import { PrismaService } from '../prisma/prisma.service';
import { AlumniController } from './controllers/alumni.controller';
import { AlumniRepository } from './repositories/alumni.repository';
import { AlumniProfileService } from './services/alumni-profile.service';
import { AlumniService } from './services/alumni.service';
@Module({
  controllers: [AlumniController],
  providers: [
    AlumniService,
    AlumniProfileService,
    GeolocationService,
    PrismaService,
    AlumniRepository,
    Logger,
    GeolocationService,
    AgentsApiService,
    OtpService,
  ],
  exports: [AlumniService],
})
export class AlumniModule {}
