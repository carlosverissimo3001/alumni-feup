import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { UserService } from './user.service';
import { LinkedinAuthDto, UserAuthResponse } from '@/dto';

@ApiTags('V1', 'User')
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

  /* @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout a user' })
  async logout() {
    return this.userService.logout();

    Should we "blacklist" the token? Or just let it expire?
  } */
}