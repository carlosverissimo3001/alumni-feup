import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class OtpService {
  constructor(private readonly redisService: RedisService) {}

  private hash(code: string) {
    return crypto.createHash('sha256').update(code).digest('hex');
  }

  async generateOTP(email: string): Promise<string> {
    const otp = crypto.randomInt(100000, 999999).toString();
    const hashed = this.hash(otp);

    await this.redisService.set(`otp:${email}`, hashed, 600); // 10 min

    return otp;
  }

  async verifyOTP(email: string, code: string): Promise<boolean> {
    const hashed = this.hash(code);
    const stored = await this.redisService.get(`otp:${email}`);

    if (stored && stored === hashed) {
      await this.redisService.del(`otp:${email}`);
      return true;
    }
    return false;
  }
}
