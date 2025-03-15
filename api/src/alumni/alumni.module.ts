import { Module } from '@nestjs/common';
import { AlumniService } from './services/alumni.service';
import { AlumniController } from './controllers/alumni.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AlumniRepository } from './repositories/alumni.repository';
import { Logger } from '@nestjs/common';
import { GeolocationService } from '../geolocation/geolocation.service';
@Module({
  controllers: [AlumniController],
  providers: [
    AlumniService,
    PrismaService,
    AlumniRepository,
    Logger,
    GeolocationService,
  ],
})

export class AlumniModule {}
