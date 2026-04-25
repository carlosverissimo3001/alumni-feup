import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { SessionService, SESSION_COOKIE_NAME } from './session.service';
import { SessionId } from './session-id.decorator';
import {
  getClearCookieOptions,
  getClearUserCookieOptions,
} from './cookie-options';
import { LogoutResponseDto } from './dto/logout-response.dto';

@ApiTags('V1')
@Controller('auth')
export class AuthController {
  constructor(private readonly sessionService: SessionService) {}

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Logout and clear session' })
  @ApiOkResponse({ type: LogoutResponseDto })
  async logout(
    @SessionId() sessionId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LogoutResponseDto> {
    await this.sessionService.deleteSession(sessionId);
    res.clearCookie(SESSION_COOKIE_NAME, getClearCookieOptions());
    res.clearCookie('user', getClearUserCookieOptions());
    return { success: true };
  }
}
