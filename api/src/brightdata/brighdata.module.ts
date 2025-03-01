import { Logger, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { BrightdataService } from './services/brightdata.service';
import { BrightdataConsumer } from './consumers/brighdata.consumer';
import { PrismaService } from '../prisma/prisma.service';
import { QueueName, DEFAULT_JOB_OPTIONS } from '../consts';

@Module({
  imports: [
    BullModule.registerQueue({
      name: QueueName.BRIGHTDATA,
      defaultJobOptions: DEFAULT_JOB_OPTIONS,
    }),
  ],
  providers: [BrightdataService, PrismaService, BrightdataConsumer, Logger],
  exports: [BrightdataService],
})
export class BrightdataModule {}
