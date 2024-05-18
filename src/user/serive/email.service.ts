import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendVerificationEmail(to: string, token: string) {
    const url = `http://yourdomain.com/verify-email?token=${token}`;

    await this.transporter.sendMail({
      to,
      subject: 'Verify your email',
      html: `Click <a href="${url}">here</a> to verify your email.`,
    });
  }
}
