import { Module, Logger } from '@nestjs/common';
import { GeolocationService } from './geolocation.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [GeolocationService, PrismaService, Logger],
  exports: [GeolocationService],
})
export class GeolocationModule {}
