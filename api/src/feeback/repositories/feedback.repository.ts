import { SendFeedbackDto } from '@/dto/send-feedback.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FeedbackRepository {
  constructor(private readonly prisma: PrismaService) {}

  async insertFeedback(feedback: SendFeedbackDto) {
    return this.prisma.feedback.create({
      data: feedback,
    });
  }
}
