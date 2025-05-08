import { Module } from '@nestjs/common';
import { FeedbackController } from './controllers/feedback.controller';
import { FeedbackService } from './services/feeback.service';
import { FeedbackRepository } from './repositories/feedback.repository';
import { PrismaService } from '@/prisma/prisma.service';
import { EmailService } from '@/email/services/email.service';

@Module({
  controllers: [FeedbackController],
  providers: [FeedbackService, FeedbackRepository, PrismaService, EmailService],
})
export class FeedbackModule {}
