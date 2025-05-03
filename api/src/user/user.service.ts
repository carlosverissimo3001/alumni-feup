import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import {
  LinkedinAuthDto,
  UserAuthResponse,
  VerifyEmailDto,
  VerifyEmailTokenDto,
} from '@/dto';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OtpService } from '../otp/otp.service';
import { UserStatus } from '@/dto/user.dto';
import { sanitizeLinkedinUrl } from '@/alumni/utils';
@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: Logger,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly otpService: OtpService,
  ) {}

  async linkedinAuth(body: LinkedinAuthDto): Promise<UserAuthResponse> {
    this.logger.log(
      `LinkedIn auth attempt for user: ${body.firstName} ${body.lastName} with personId: ${body.personId}`,
    );

    // Try to find a match using person ID
    const alumni = await this.prisma.alumni.findFirst({
      where: {
        personId: body.personId,
      },
    });

    // If no match found, throw an unauthorized exception
    if (!alumni) {
      this.logger.warn(
        `No alumni match found for LinkedIn user: ${body.personId}`,
      );

      return {
        status: UserStatus.UNMATCHED,
        personId: body.personId,
      };
    }

    this.logger.log(
      `Found alumni match for LinkedIn user: ${body.personId} with alumni: ${alumni.id}`,
    );

    // Update the personalEmail, if it exists in the payload
    if (body.personalEmail) {
      await this.prisma.alumni.update({
        where: { id: alumni.id },
        data: { personalEmail: body.personalEmail },
      });
    }

    // Set the metadata
    await this.prisma.alumni.update({
      where: { id: alumni.id },
      data: { metadata: JSON.stringify(body) },
    });

    // 3. Generate a JWT token
    const payload = {
      sub: alumni.id,
      firstName: alumni.firstName,
      lastName: alumni.lastName,
      personId: body.personId,
    };

    const token = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_EXPIRATION') || '1d',
    });

    // 4. Return the token and user info
    return {
      status: UserStatus.MATCHED,
      access_token: token,
      user: {
        id: alumni.id,
        firstName: alumni.firstName,
        lastName: alumni.lastName,
        profilePictureUrl: alumni.profilePictureUrl,
      },
    };
  }

  /**
   * Generates a verification code and saves it to Redis
   * @param body - The body of the request
   */
  async verifyEmail(body: VerifyEmailDto): Promise<void> {
    const { email } = body;

    // ! *** NOT READY FOR PROD CODE START ***
    const code = '123456';
    const hashed = this.otpService['hash'](code);
    await this.otpService['redis'].set(`otp:${email}`, hashed, 'EX', 600);
    console.log(`Test code set for ${email}: ${code}`);
    // ! *** NOT READY FOR PROD CODE END ***

    // *** ACTUAL GOOD LOGIC START ***
    // const code = await this.otpService.generateOTP(email);
    // await this.mailService.sendEmail({
    //   to: email,
    //   subject: 'Your Verification Code',
    //   text: `Your verification code is: ${code}`,
    // });
    // *** ACTUAL GOOD LOGIC END ***
  }

  /**
   * Verifies the email token
   * @param body - The body of the request
   */
  async verifyEmailToken(body: VerifyEmailTokenDto): Promise<void> {
    const { email, token } = body;
    const isValid = await this.otpService.verifyOTP(email, token);

    if (!isValid) {
      throw new HttpException(
        'Invalid verification code',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async linkedinConfirm(body: LinkedinAuthDto): Promise<UserAuthResponse> {
    const { personId, linkedinUrl } = body;

    if (!linkedinUrl) {
      throw new HttpException(
        'LinkedIn URL is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    const sanitizedLinkedinUrl = sanitizeLinkedinUrl(linkedinUrl);

    this.logger.log(
      `LinkedIn confirm attempt for user: ${personId} with LinkedIn URL: ${sanitizedLinkedinUrl}`,
    );

    const alumni = await this.prisma.alumni.findFirst({
      where: {
        linkedinUrl: sanitizedLinkedinUrl,
      },
    });

    if (!alumni) {
      throw new HttpException('Alumni not found', HttpStatus.NOT_FOUND);
    }

    // Let's now set the personId
    await this.prisma.alumni.update({
      where: {
        id: alumni.id,
      },
      data: {
        personId,
      },
    });

    // and set the metadata
    await this.prisma.alumni.update({
      where: { id: alumni.id },
      data: { metadata: JSON.stringify(body) },
    });

    const payload = {
      sub: alumni.id,
      firstName: alumni.firstName,
      lastName: alumni.lastName,
      personId,
    };

    const token = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_EXPIRATION') || '1d',
    });

    return {
      status: UserStatus.MATCHED,
      access_token: token,
      user: {
        id: alumni.id,
        firstName: alumni.firstName,
        lastName: alumni.lastName,
        profilePictureUrl: alumni.profilePictureUrl,
      },
    };
  }
}
