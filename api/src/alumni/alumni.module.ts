import { Logger, Module } from '@nestjs/common';
import { AgentsApiModule } from '@/agents-api/agents-api.module';
import { GeolocationModule } from '@/geolocation/geolocation.module';
import { PrismaModule } from '@/prisma/prisma.module';
import { AlumniController } from './controllers/alumni.controller';
import { AlumniRepository } from './repositories/alumni.repository';
import { AlumniProfileService } from './services/alumni-profile.service';
import { AlumniService } from './services/alumni.service';

@Module({
  imports: [GeolocationModule, AgentsApiModule, PrismaModule],
  controllers: [AlumniController],
  providers: [AlumniService, AlumniProfileService, AlumniRepository, Logger],
  exports: [AlumniService, AlumniRepository],
})
export class AlumniModule {}
