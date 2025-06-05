import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({ log: ['query', 'error', 'warn'] });
  }

  async onModuleInit() {
    this.$on('query', (e) => {
      const threshold = 100; // ms
      if (e.duration > threshold) {
        this.logger.warn(`Slow query (${e.duration}ms): ${e.query}`);
      }
    });
    await this.$connect();
  }
}
