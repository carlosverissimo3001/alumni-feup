import { Injectable } from '@nestjs/common';
import { LinkedinAuthDto, ManualSubmissionDto } from '@/dto';
import { PrismaService } from '../prisma/prisma.service';
import { Logger } from '@nestjs/common';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: Logger,
  ) {}

  async linkedinAuth(body: LinkedinAuthDto) {
    // Here, we ill match the user who just logged in with the Alumni data we have in the database
    this.logger.log(body);
  }

  async manualSubmission(body: ManualSubmissionDto) {
    this.logger.log(body);
  }
}
