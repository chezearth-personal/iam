import nodemailer from 'nodemailer';
import config from 'config';
import pug from 'pug';
import { convert } from 'html-to-text';
import { User } from '../entities';

const smtp = config.get<{
  host: string;
  port: number;
  user: string;
  pass: string;
}>('smtp');

/** ? SMTP configurations */
export { Email };

class Email {
  firstName: string;
  to: string;
  from: string;
  /** ? Constructor */
  constructor(public user: User, public url: string) {
    this.firstName = user.firstName;
    this.to = user.email;
    this.from = `Admin ${config.get<string>('emailFrom')}`;
  }

  private newTransport() {
    // if (process.env.NODE_ENV === 'production') {
    //   console.log('Hello');
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
    const html = pug.renderFile(`${__dirname}/../views/${template}.pug`, {
      firstName: this.firstName,
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
    /** Send email */
    const info = await this.newTransport().sendMail(mailOptions);
    console.log(nodemailer.getTestMessageUrl(info));
  }

  /** ? Method to send emails */
  async sendVerificationCode() {
    await this.send('verificationCode', 'Your account verification code');
  }
  async sendPasswordResetToken() {
    await this.send(
      'resetPassword',
      'Your password reset token (valid for only 10 minutes)'
    );
  }
}
