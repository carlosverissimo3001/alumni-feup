import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import * as crypto from 'crypto';

@Injectable()
export class OtpService {
  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis,
  ) {}

  private hash(code: string) {
    return crypto.createHash('sha256').update(code).digest('hex');
  }


  async generateOTP(email: string): Promise<string> {
    const otp = crypto.randomInt(100000, 999999).toString();
    const hashed = this.hash(otp);

    await this.redis.set(`otp:${email}`, hashed, 'EX', 600); // 10 min

    return otp;
  }

  async verifyOTP(email: string, code: string): Promise<boolean> {
    const hashed = this.hash(code);
    const stored = await this.redis.get(`otp:${email}`);

    if (stored && stored === hashed) {
      await this.redis.del(`otp:${email}`);
      return true;
    }
    return false;
  }
}
