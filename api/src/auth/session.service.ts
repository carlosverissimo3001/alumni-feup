import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';
import { randomUUID } from 'crypto';

export interface SessionData {
  userId: string;
  createdAt: number;
}

export const SESSION_COOKIE_NAME = 'alumniFeup_session';

@Injectable()
export class SessionService {
  private readonly sessionMaxAge: number;

  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {
    this.sessionMaxAge =
      this.configService.get<number>('SESSION_MAX_AGE_SECONDS') || 604800; // 7 days
  }

  get maxAgeSeconds(): number {
    return this.sessionMaxAge;
  }

  async createSession(userId: string): Promise<string> {
    const sessionId = randomUUID();

    const session: SessionData = {
      userId,
      createdAt: Date.now(),
    };

    await this.redisService.set(
      `session:${sessionId}`,
      JSON.stringify(session),
      this.sessionMaxAge,
    );

    return sessionId;
  }

  async getSession(sessionId: string): Promise<SessionData> {
    const data = await this.redisService.get(`session:${sessionId}`);
    if (!data) {
      throw new UnauthorizedException('Session not found or expired');
    }

    try {
      return JSON.parse(data) as SessionData;
    } catch {
      throw new UnauthorizedException('Corrupted session data');
    }
  }

  async refreshSession(sessionId: string): Promise<void> {
    const key = `session:${sessionId}`;
    const exists = await this.redisService.exists(key);
    if (exists) {
      await this.redisService.expire(key, this.sessionMaxAge);
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.redisService.del(`session:${sessionId}`);
  }
}
