import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';
import { randomUUID } from 'crypto';

export interface LinkedinProfile {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: { country: string; language: string };
  email?: string;
  email_verified?: boolean;
}

interface LinkedinTokenResponse {
  access_token: string;
  expires_in: number;
  error_description?: string;
}

@Injectable()
export class LinkedinOAuthService {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;
  private readonly scope: string;
  private readonly userInfoUrl: string;
  private readonly stateTtl = 600; // 10 minutes
  private readonly pendingProfileTtl = 300; // 5 minutes

  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {
    this.clientId = this.configService.getOrThrow<string>('LINKEDIN_CLIENT_ID');
    this.clientSecret = this.configService.getOrThrow<string>(
      'LINKEDIN_CLIENT_SECRET',
    );
    this.redirectUri = this.configService.getOrThrow<string>(
      'LINKEDIN_REDIRECT_URI',
    );
    this.scope =
      this.configService.get<string>('LINKEDIN_SCOPE') || 'openid profile email';
    this.userInfoUrl =
      this.configService.get<string>('LINKEDIN_USER_INFO_URL') ||
      'https://api.linkedin.com/v2/userinfo';
  }

  async generateAuthUrl(): Promise<{ url: string; state: string }> {
    const state = randomUUID();

    await this.redisService.set(
      `oauth_state:${state}`,
      JSON.stringify({ createdAt: Date.now() }),
      this.stateTtl,
    );

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      state,
      scope: this.scope,
    });

    return {
      url: `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`,
      state,
    };
  }

  async validateAndConsumeState(state: string): Promise<void> {
    const key = `oauth_state:${state}`;
    const data = await this.redisService.get(key);

    if (!data) {
      throw new UnauthorizedException('Invalid or expired OAuth state');
    }

    await this.redisService.del(key);
  }

  async exchangeCodeForToken(code: string): Promise<string> {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.redirectUri,
      client_id: this.clientId,
      client_secret: this.clientSecret,
    });

    const response = await fetch(
      'https://www.linkedin.com/oauth/v2/accessToken',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      },
    );

    const data = (await response.json()) as LinkedinTokenResponse;

    if (!response.ok) {
      throw new UnauthorizedException(
        data.error_description || 'Failed to exchange authorization code',
      );
    }

    return data.access_token;
  }

  async fetchProfile(accessToken: string): Promise<LinkedinProfile> {
    const response = await fetch(this.userInfoUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new UnauthorizedException('Failed to fetch LinkedIn profile');
    }

    return (await response.json()) as LinkedinProfile;
  }

  async storePendingProfile(
    sessionId: string,
    profile: LinkedinProfile,
  ): Promise<void> {
    await this.redisService.set(
      `pending_profile:${sessionId}`,
      JSON.stringify(profile),
      this.pendingProfileTtl,
    );
  }

  async getPendingProfile(sessionId: string): Promise<LinkedinProfile | null> {
    const data = await this.redisService.get(`pending_profile:${sessionId}`);
    if (!data) return null;

    try {
      return JSON.parse(data) as LinkedinProfile;
    } catch {
      return null;
    }
  }

  async deletePendingProfile(sessionId: string): Promise<void> {
    await this.redisService.del(`pending_profile:${sessionId}`);
  }
}
