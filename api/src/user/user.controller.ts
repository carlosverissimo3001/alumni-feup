import { Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { LinkedinAuthDto, ManualSubmissionDto } from '@/dto';
import { Body } from '@nestjs/common';
@ApiTags('V1', 'User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('linkedinAuth')
  @ApiOperation({ summary: 'Authenticate a user with LinkedIn' })
  /* @ApiResponse({
    type: Alumni,
    description: 'User authenticated and/or matched successfully',
  }) */
  async linkedinAuth(@Body() body: LinkedinAuthDto) {
    return this.userService.linkedinAuth(body);
  }

  @Post('submission')
  @ApiOperation({ summary: 'Manual submission of a user' })
  async submission(@Body() body: ManualSubmissionDto) {
    return this.userService.manualSubmission(body);
  }
}
