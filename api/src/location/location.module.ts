import { Module } from '@nestjs/common';
import { LocationService } from './location.service';
import { PrismaService } from '@/prisma/prisma.service';
@Module({
  providers: [LocationService, PrismaService],
  exports: [LocationService],
})
export class LocationModule {}
