import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UnauthorizedException,
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
import { getClearCookieOptions } from './cookie-options';
import { LogoutResponseDto } from './dto/logout-response.dto';
import { UserService } from '../user/services/user.service';
import { User } from '../user/dto/user.dto';

@ApiTags('V1')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly sessionService: SessionService,
    private readonly userService: UserService,
  ) {}

  @Get('me')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Get the currently authenticated user' })
  @ApiOkResponse({ type: User })
  async me(@SessionId() sessionId: string): Promise<User> {
    const session = await this.sessionService.getSession(sessionId);
    if (session.userId.startsWith('pending:')) {
      throw new UnauthorizedException('Session is pending profile match');
    }

    const user = await this.userService.getUserById(session.userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    await this.sessionService.refreshSession(sessionId);
    return user;
  }

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
    return { success: true };
  }
}
