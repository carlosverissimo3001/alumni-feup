import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Delete,
  Param,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CheckPermissionDto,
  CheckPermissionResponse,
  LinkedinAuthDto,
  UserAuthResponse,
  VerifyEmailDto,
  VerifyEmailTokenDto,
} from '../dto';
import { UserService } from '../services/user.service';

@ApiTags('V1')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('linkedinAuth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate a user with LinkedIn' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User authenticated successfully',
    type: UserAuthResponse,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'No matching alumni record found',
  })
  async linkedinAuth(@Body() body: LinkedinAuthDto) {
    return this.userService.linkedinAuth(body);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Verify the email of the alumni by generating a token and sending it to the email',
  })
  @ApiResponse({
    description: 'Returns the verified email',
  })
  async verifyEmail(@Body() body: VerifyEmailDto): Promise<void> {
    return this.userService.verifyEmail(body);
  }

  @Post('verify-email/token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate the token against the email' })
  @ApiResponse({
    description: 'Returns the status of the validation',
  })
  async verifyEmailToken(@Body() body: VerifyEmailTokenDto): Promise<void> {
    return this.userService.verifyEmailToken(body);
  }

  @Post('linkedin-confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Confirm the LinkedIn profile and generate a JWT token',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User authenticated successfully',
    type: UserAuthResponse,
  })
  async linkedinConfirm(
    @Body() body: LinkedinAuthDto,
  ): Promise<UserAuthResponse> {
    return this.userService.linkedinConfirm(body);
  }

  @Post('check-permission')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check if a user has a permission' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User has the permission',
    type: CheckPermissionResponse,
  })
  async checkPermission(
    @Body() body: CheckPermissionDto,
  ): Promise<CheckPermissionResponse> {
    return this.userService.checkPermission(body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User deleted successfully',
  })
  async deleteUser(@Param('id') id: string): Promise<void> {
    return this.userService.deleteUser(id);
  }
}
