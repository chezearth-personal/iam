import nodemailer from 'nodemailer';
import config from 'config';
import pug from 'pug';
import { convert } from 'html-to-text';
import { User } from '../entities';
import { logger } from '../utils';
import {log} from 'console';

const smtp = config.get<{
  host: string;
  port: number;
  user: string;
  pass: string;
}>('smtp');

/** ? SMTP configurations */
export { Email };

class Email {
  firstname: string;
  to: string;
  from: string;
  /** ? Constructor */
  constructor(public user: User, public url: string) {
    this.firstname = user.firstname;
    this.to = user.email;
    this.from = `Admin ${config.get<string>('emailFrom')}`;
    // logger.log('DEBUG', `this.firstname = ${this.firstname}`);
    // logger.log('DEBUG', `this.to = ${this.to}`);
    logger.log('DEBUG', `this.from = ${this.from}`);
  }

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

  /** ? Transport */

  private async send(template: string, subject: string) {
    /** Generate HTML template based on the template string */
    // logger.log('DEBUG', `template = ${template}, subject = ${subject}`);
    // logger.log('DEBUG', `pug file = ${__dirname}/../views/${template}.pug`);
    // const compiledFunction = pug.compileFile(`${__dirname}/../views/${template}.pug`);
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
    // logger.log('DEBUG', `mailOptions = ${JSON.stringify(mailOptions)}`);
    /** Send email */
    const info = await this.newTransport().sendMail(mailOptions);
    logger.log('DEBUG', nodemailer.getTestMessageUrl(info));
  }

  /** ? Method to send emails */
  async sendVerificationCode() {
    await this.send('verificationcode', 'Your account verification code');
  }
  async sendPasswordResetToken() {
    await this.send(
      'resetPassword',
      'Your password reset token (valid for only 10 minutes)'
    );
  }
}
