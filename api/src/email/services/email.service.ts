// mail.service.ts
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { EMAIL_SERVICE, ADMINISTRATOR_EMAILS } from '@/consts';
import * as fs from 'fs';
import * as path from 'path';
import { SendFeedbackDto } from '@/dto/send-feedback.dto';

const TEMPLATES_PATH = path.join(process.cwd(), 'src', 'templates');

@Injectable()
export class EmailService {
  constructor(private readonly configService: ConfigService) {}

  private get transporter() {
    return nodemailer.createTransport({
      service: EMAIL_SERVICE,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASSWORD'),
      },
    });
  }

  private get senderEmail() {
    const smtpUser = this.configService.get<string>('SMTP_USER') || '';
    return `"AlumniEI FEUP" <${smtpUser}>`;
  }

  private compileTemplate(
    templateName: string,
    data: Record<string, string | number>,
  ): string {
    try {
      const templatePath = path.join(TEMPLATES_PATH, `${templateName}.hbs`);
      const templateSource = fs.readFileSync(templatePath, 'utf-8');

      return templateSource.replace(/{{([^{}]+)}}/g, (_, key: string) => {
        const propKey = key.trim();
        return data[propKey] !== undefined ? String(data[propKey]) : '';
      });
    } catch (error) {
      console.error(`Failed to compile template ${templateName}:`, error);
      return `<p>Your verification code is: <strong>${String(data.otp)}</strong></p>`;
    }
  }

  async sendOtpEmail(to: string, otp: string) {
    const html = this.compileTemplate('otp', { otp });

    await this.transporter.sendMail({
      from: this.senderEmail,
      to,
      subject: 'Your Verification Code',
      html,
    });
  }

  async sendFeedbackEmail(feedback: SendFeedbackDto) {
    const templateData = {
      name: feedback.name,
      email: feedback.email,
      feedback: feedback.feedback,
      type: feedback.type,
    };

    const html = this.compileTemplate('feedback', templateData);

    for (const email of ADMINISTRATOR_EMAILS) {
      await this.transporter.sendMail({
        from: this.senderEmail,
        to: email,
        subject: 'New Feedback: ' + feedback.type,
        html,
      });
    }
  }
}
