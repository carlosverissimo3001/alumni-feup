import { BullModule } from '@nestjs/bull';
import { Module, Logger } from '@nestjs/common';
import { DEFAULT_JOB_OPTIONS, QueueName } from 'src/consts';
import { GeolocationService } from './geolocation.service';
import { GeolocationConsumer } from './geolocation.consumer';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: QueueName.GEOLOCATION,
      defaultJobOptions: DEFAULT_JOB_OPTIONS,
    }),
  ],
  providers: [GeolocationService, GeolocationConsumer, PrismaService, Logger],
  exports: [GeolocationService],
})
export class GeolocationModule {}
