import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { SessionService, SESSION_COOKIE_NAME } from './session.service';
import { SessionId } from './session-id.decorator';
import { getClearCookieOptions } from './cookie-options';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly sessionService: SessionService) {}

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Logout and clear session' })
  @ApiResponse({ status: 200, description: 'Successfully logged out' })
  async logout(
    @SessionId() sessionId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.sessionService.deleteSession(sessionId);
    res.clearCookie(SESSION_COOKIE_NAME, getClearCookieOptions());
    return { success: true };
  }
}
