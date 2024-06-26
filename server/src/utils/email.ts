import nodemailer from 'nodemailer';
import config from 'config';
import pug from 'pug';
import { convert } from 'html-to-text';
import { User } from 'entities/user.entity';
import { logger } from './logger';
// import {number} from 'zod';

/** ? SMTP configurations */
const smtp = config.get<{
  host: string;
  port: number;
  user: string;
  pass: string;
}>('smtp');

export class Email {
  firstname: string;
  to: string;
  from: string;
  /** ? Constructor */
  constructor(public user: User, public url: string) {
    this.firstname = user.firstname;
    this.to = user.email;
    this.from = `Admin ${config.get<string>('emailFrom')}`;
  }

  /** ? Transport */
  private newTransport() {
    // if (process.env.NODE_ENV === 'production') {
    //   logger.log('DEBUG', 'Hello');
    // }

    return nodemailer.createTransport({
      ...smtp,
      auth: {
        user: smtp.user,
        pass: smtp.pass,
      },
    });
  }

  private async send(template: string, subject: string) {
    /** Generate HTML template based on the template string */
    const html = pug.renderFile(`${__dirname}/../views/${template}.pug`, {
      firstname: this.firstname,
      subject,
      url: this.url,
    });
    /** Create email options */
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      text: convert(html),
      html
    };
    // logger.log('DEBUG', `verification url = ${this.url}`);
    /** Send email */
    const info = await this.newTransport().sendMail(mailOptions);
    // logger.log('DEBUG', nodemailer.getTestMessageUrl(info));
  }

  /** ? Method to send emails */
  async sendVerificationCode() {
    await this.send('verificationcode', 'Your account verification code');
  }
  async sendPasswordResetToken() {
    await this.send(
      'resetPassword',
      `Your password reset token (valid for only ${config
        .get<number>('resetPasswordExpiresIn')} minute${config
        .get<number>('resetPasswordExpiresIn') > 1 ? 's' : ''})`
    );
  }
}
