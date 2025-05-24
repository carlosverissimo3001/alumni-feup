import { SendFeedbackDto } from '@/feeback/dto/send-feedback.dto';
import { Controller, HttpCode, HttpStatus, Post, Body } from '@nestjs/common';
import { FeedbackService } from '../services/feeback.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('V1')
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary:
      'Handles the feedback by inserting it into the database and sending an email to the administrators',
  })
  async create(@Body() data: SendFeedbackDto) {
    return this.feedbackService.handleFeedback(data);
  }
}
