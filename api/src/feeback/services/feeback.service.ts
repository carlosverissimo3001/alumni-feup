import { Injectable } from '@nestjs/common';
import { SendFeedbackDto } from '@/feeback/dto/send-feedback.dto';
import { FeedbackRepository } from '../repositories/feedback.repository';
import { EmailService } from '@/email/services/email.service';

@Injectable()
export class FeedbackService {
  constructor(
    private readonly feedbackRepository: FeedbackRepository,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Handles the feedback by inserting it into the database and sending an email to the administrators
   * @param feedback - The feedback to handle
   */
  async handleFeedback(feedback: SendFeedbackDto) {
    await Promise.all([
      this.feedbackRepository.insertFeedback(feedback),
      this.emailService.sendFeedbackEmail(feedback),
    ]);
  }
}
