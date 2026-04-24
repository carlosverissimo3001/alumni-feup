import {
  Controller,
  Get,
  Logger,
  Query,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { LinkedinOAuthService } from './linkedin-oauth.service';
import { SessionService, SESSION_COOKIE_NAME } from './session.service';
import { SessionId } from './session-id.decorator';
import { getCookieOptions } from './cookie-options';
import { UserService } from '../user/services/user.service';
import { UserStatus } from '../user/consts/enum';

@ApiTags('V1')
@Controller('auth/linkedin')
export class LinkedinOAuthController {
  private readonly frontendUrl: string;
  private readonly logger = new Logger(LinkedinOAuthController.name);

  constructor(
    private readonly linkedinOAuthService: LinkedinOAuthService,
    private readonly sessionService: SessionService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {
    this.frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
  }

  @Get('login')
  @ApiOperation({ summary: 'Start LinkedIn OAuth flow' })
  @ApiResponse({ status: 302, description: 'Redirects to LinkedIn authorization' })
  async login(@Res() res: Response) {
    const { url } = await this.linkedinOAuthService.generateAuthUrl();
    res.redirect(url);
  }

  @Get('callback')
  @ApiOperation({ summary: 'Handle LinkedIn OAuth callback' })
  @ApiResponse({ status: 302, description: 'Redirects to frontend after auth' })
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string | undefined,
    @Res() res: Response,
  ) {
    if (error) {
      this.logger.warn(`LinkedIn OAuth error: ${error}`);
      return res.redirect(
        `${this.frontendUrl}/login?error=${encodeURIComponent(error)}`,
      );
    }

    if (!code || !state) {
      return res.redirect(
        `${this.frontendUrl}/login?error=missing_params`,
      );
    }

    try {
      // Validate state (CSRF protection)
      await this.linkedinOAuthService.validateAndConsumeState(state);

      // Exchange code for token and fetch profile
      const accessToken =
        await this.linkedinOAuthService.exchangeCodeForToken(code);
      const profile =
        await this.linkedinOAuthService.fetchProfile(accessToken);

      // Try to match the user
      const authResponse = await this.userService.linkedinAuth({
        personId: profile.sub,
        firstName: profile.given_name,
        lastName: profile.family_name,
        personalEmail: profile.email,
        profilePictureUrl: profile.picture,
      });

      if (authResponse.status === UserStatus.UNMATCHED) {
        // Create a session for the pending user and store profile in Redis
        const sessionId = await this.sessionService.createSession(
          `pending:${profile.sub}`,
        );
        await this.linkedinOAuthService.storePendingProfile(
          sessionId,
          profile,
        );

        res.cookie(
          SESSION_COOKIE_NAME,
          sessionId,
          getCookieOptions(this.sessionService.maxAgeSeconds),
        );

        return res.redirect(`${this.frontendUrl}/auth/linkedin-confirm`);
      }

      // Matched user — create a real session
      const sessionId = await this.sessionService.createSession(
        authResponse.user!.id,
      );

      res.cookie(
        SESSION_COOKIE_NAME,
        sessionId,
        getCookieOptions(this.sessionService.maxAgeSeconds),
      );

      // Set non-sensitive user data for frontend hydration
      res.cookie('user', JSON.stringify(authResponse.user), {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: this.sessionService.maxAgeSeconds * 1000,
      });

      return res.redirect(`${this.frontendUrl}/analytics`);
    } catch (err) {
      this.logger.error('OAuth callback error', err);
      return res.redirect(
        `${this.frontendUrl}/login?error=auth_failed`,
      );
    }
  }

  @Get('pending')
  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Get pending LinkedIn profile for unmatched users',
  })
  @ApiResponse({ status: 200, description: 'Pending LinkedIn profile data' })
  @ApiResponse({ status: 401, description: 'Not authenticated or no pending profile' })
  async getPendingProfile(@SessionId() sessionId: string) {
    const profile =
      await this.linkedinOAuthService.getPendingProfile(sessionId);

    if (!profile) {
      throw new UnauthorizedException('No pending profile found');
    }

    return {
      personId: profile.sub,
      firstName: profile.given_name,
      lastName: profile.family_name,
      personalEmail: profile.email,
      profilePictureUrl: profile.picture,
    };
  }
}
