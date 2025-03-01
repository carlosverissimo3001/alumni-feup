import { Process, InjectQueue, Processor } from '@nestjs/bull';
import { BrightdataService } from '../services/brightdata.service';
import { Jobs, QueueName, JobDataMap } from '../../consts';
import { Queue, Job } from 'bull';
import { OnModuleInit } from '@nestjs/common';
import { Logger } from '@nestjs/common';

@Processor(QueueName.BRIGHTDATA)
export class BrightdataConsumer implements OnModuleInit {
  constructor(
    private readonly service: BrightdataService,
    @InjectQueue(QueueName.BRIGHTDATA)
    private readonly queue: Queue,
    private readonly logger: Logger,
  ) {}

  async onModuleInit() {
    await this.queue.add(
      Jobs.brightdata.BATCH_SCRAPE,
      { data: null },
      {
        jobId: '123',
        repeat: {
          cron: '0 9 1 */3 *', // At 09:00 on day-of-month 1 in every 3rd month
        },
      },
    );
  }

  @Process(Jobs.brightdata.BATCH_SCRAPE)
  batchScrape() {
    this.logger.log('Started batch scrape at ' + new Date().toISOString());
    // this.service.something()
  }

  @Process(Jobs.brightdata.SCRAPE)
  async scrape(job: Job<JobDataMap[typeof Jobs.brightdata.SCRAPE]>) {
    await this.service.scrape(job.data.alumni);
  }
}
