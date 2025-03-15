import { Process, Processor } from '@nestjs/bull';
import { InjectQueue } from '@nestjs/bull';
import { Logger /* , OnModuleInit */ } from '@nestjs/common';
import { Queue } from 'bull';
import { Jobs, QueueName } from 'src/consts';
import { GeolocationService } from './geolocation.service';

@Processor(QueueName.GEOLOCATION)
export class GeolocationConsumer /* implements OnModuleInit */ {
  constructor(
    private readonly service: GeolocationService,
    @InjectQueue(QueueName.GEOLOCATION)
    private readonly queue: Queue,
    private readonly logger: Logger,
  ) {}

  async onModuleInit() {
    await this.queue.add(
      Jobs.geolocation.EXTRACT_COORDINATES,
      { data: null },
      {
        jobId: `${Jobs.geolocation.EXTRACT_COORDINATES}-${Date.now()}`,
        repeat: {
          cron: '0 * * * *', // Every hour
        },
      },
    );
  }

  @Process(Jobs.geolocation.EXTRACT_COORDINATES)
  async extractCoordinates() {
    this.logger.log('Started job to extract coordinates for missing locations');
    return this.service.findMissingCoordinates();
  }
}
