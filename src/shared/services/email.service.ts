import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly email: string;
  private readonly password: string;
  constructor(private configService: ConfigService) {
    const EMAIL_USER = this.configService.get<string>('EMAIL_USER');
    const EMAIL_PASS = this.configService.get<string>('EMAIL_PASS');
    if (!EMAIL_USER || !EMAIL_PASS) {
      throw new Error('EMAIL OR PASSWORD IS NOT SET IN EMAIL SERVICE');
    }
    this.email = EMAIL_USER;
    this.password = EMAIL_PASS;
  }
  async sendChangePasswordEmail(toEmail: string, link: string, lang: string) {
    const emailTemplate =
      lang === 'ru'
        ? `
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Сброс пароля DON-VIP.COM</title>
        <style type="text/css">
          @media only screen and (max-width: 600px) {
            .main-container { width: 100% !important; }
            .button { width: 100% !important; }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f4;">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table class="main-container" width="600" style="background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                <tr>
                  <td align="center" style="padding: 30px 30px 20px; border-bottom: 1px solid #eee;">
                    <h1 style="margin: 0; font-size: 18px; color: #333; font-weight: bold;">DON-VIP.COM</h1>
                    <p style="margin: 0; font-size: 12px; color: #0066ff;">Деньги - это просто!</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 30px;">
                    <h2 style="font-size: 24px; color: #333; text-align: center;">Восстановление пароля</h2>
                    <p>Здравствуйте!</p>
                    <p>Мы получили запрос на сброс пароля. Чтобы сбросить его, нажмите на кнопку ниже:</p>
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="${link}" style="background: #0066ff; color: #fff; padding: 14px 20px; border-radius: 6px; text-decoration: none; font-weight: bold;">Сбросить пароль</a>
                    </div>
                    <p>Если кнопка не работает, используйте ссылку ниже:</p>
                    <p style="background: #f8f8f8; padding: 10px; border-radius: 4px; border: 1px solid #eee; word-break: break-word;">${link}</p>
                    <p>Ссылка действительна в течение 24 часов.</p>
                    <p>Если вы не запрашивали сброс, проигнорируйте письмо или обратитесь в поддержку.</p>
                    <p>С уважением,<br><strong>Команда DON-VIP.COM</strong></p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px 30px; background: #f8f8f8; border-top: 1px solid #eee;">
                    <p style="font-size: 14px; color: #666;"><strong>Важно:</strong> Никогда не передавайте эту ссылку другим лицам.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px 30px; background: #333; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
                    <p style="text-align: center; color: #fff; margin: 0;">
                      Нужна помощь? <a href="mailto:support@don-vip.com" style="color: #fff; text-decoration: underline;">support@don-vip.com</a>
                    </p>
                    <p style="text-align: center; font-size: 12px; color: #999;">© DON-VIP.COM 2025. Все права защищены.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
        : `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - DON-VIP.COM</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f4;">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table width="600" style="background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                <tr>
                  <td align="center" style="padding: 30px; border-bottom: 1px solid #eee;">
                    <h1 style="font-size: 18px; color: #333; margin: 0;">DON-VIP.COM</h1>
                    <p style="font-size: 12px; color: #0066ff; margin: 0;">Money made simple</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 30px;">
                    <h2 style="font-size: 24px; color: #333; text-align: center;">Password Reset</h2>
                    <p>Hello!</p>
                    <p>We received a request to reset your account password. Click the button below to proceed:</p>
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="${link}" style="background: #0066ff; color: #fff; padding: 14px 20px; border-radius: 6px; text-decoration: none; font-weight: bold;">Reset Password</a>
                    </div>
                    <p>If the button doesn't work, copy and paste the link below into your browser:</p>
                    <p style="background: #f8f8f8; padding: 10px; border-radius: 4px; border: 1px solid #eee; word-break: break-word;">${link}</p>
                    <p>This link is valid for 24 hours.</p>
                    <p>If you didn’t request this, please ignore it or contact our support.</p>
                    <p>Best regards,<br><strong>DON-VIP.COM Team</strong></p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px 30px; background: #f8f8f8; border-top: 1px solid #eee;">
                    <p style="font-size: 14px; color: #666;"><strong>Important:</strong> Never share this link with others. It gives access to your account.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px 30px; background: #333; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
                    <p style="text-align: center; color: #fff; margin: 0;">
                      Need help? <a href="mailto:support@don-vip.com" style="color: #fff; text-decoration: underline;">support@don-vip.com</a>
                    </p>
                    <p style="text-align: center; font-size: 12px; color: #999;">© DON-VIP.COM 2025. All rights reserved.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
    const transporter = nodemailer.createTransport({
      pool: true,
      host: 'pkz66.hoster.kz',
      port: 465,
      secure: true,
      auth: {
        user: this.email,
        pass: this.password,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions: nodemailer.SendMailOptions = {
      from: this.email,
      to: toEmail,
      subject:
        lang === 'ru'
          ? 'Сброс пароля DON-VIP.COM'
          : 'Password reset DON-VIP.COM',
      html: emailTemplate,
    };

    await transporter.sendMail(mailOptions);
  }
  async sendVerificationEmail(
    email: string,
    lang: string = 'en',
    code: string,
  ) {
    const transporter = nodemailer.createTransport({
      pool: true,
      host: 'pkz66.hoster.kz',
      port: 465,
      secure: true,
      auth: {
        user: this.email,
        pass: this.password,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const emailTemplate =
      lang === 'ru'
        ? `
    <!DOCTYPE html>
    <html lang="ru">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Подтверждение email DON-VIP.COM</title>
      <style type="text/css">
        @media only screen and (max-width: 600px) {
          .main-container { width: 100% !important; }
          .button { width: 100% !important; }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f4;">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table class="main-container" width="600" style="background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
              <tr>
                <td align="center" style="padding: 30px 30px 20px; border-bottom: 1px solid #eee;">
                  <h1 style="margin: 0; font-size: 18px; color: #333; font-weight: bold;">DON-VIP.COM</h1>
                  <p style="margin: 0; font-size: 12px; color: #0066ff;">Деньги - это просто!</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 30px;">
                  <h2 style="font-size: 24px; color: #333; text-align: center;">Подтверждение email</h2>
                  <p>Здравствуйте!</p>
                  <p>Благодарим за регистрацию на DON-VIP.COM. Для подтверждения вашего email и активации аккаунта, пожалуйста, используйте код ниже:</p>
                  <div style="text-align: center; margin: 30px 0;">
                    <div style="background: #f8f8f8; padding: 20px; border-radius: 6px; border: 1px solid #eee; display: inline-block;">
                      <span style="font-size: 28px; font-weight: bold; letter-spacing: 5px; color: #0066ff;">${code}</span>
                    </div>
                  </div>
                  <p>Код действителен в течение 30 минут.</p>
                  <p>Если вы не регистрировались на DON-VIP.COM, проигнорируйте это письмо.</p>
                  <p>С уважением,<br><strong>Команда DON-VIP.COM</strong></p>
                </td>
              </tr>
              <tr>
                <td style="padding: 20px 30px; background: #f8f8f8; border-top: 1px solid #eee;">
                  <p style="font-size: 14px; color: #666;"><strong>Важно:</strong> Никогда не передавайте этот код другим лицам.</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 20px 30px; background: #333; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
                  <p style="text-align: center; color: #fff; margin: 0;">
                    Нужна помощь? <a href="mailto:support@don-vip.com" style="color: #fff; text-decoration: underline;">support@don-vip.com</a>
                  </p>
                  <p style="text-align: center; font-size: 12px; color: #999;">© DON-VIP.COM 2025. Все права защищены.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `
        : `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verification - DON-VIP.COM</title>
      <style type="text/css">
        @media only screen and (max-width: 600px) {
          .main-container { width: 100% !important; }
          .button { width: 100% !important; }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f4;">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table class="main-container" width="600" style="background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
              <tr>
                <td align="center" style="padding: 30px 30px 20px; border-bottom: 1px solid #eee;">
                  <h1 style="margin: 0; font-size: 18px; color: #333; font-weight: bold;">DON-VIP.COM</h1>
                  <p style="margin: 0; font-size: 12px; color: #0066ff;">Money made simple</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 30px;">
                  <h2 style="font-size: 24px; color: #333; text-align: center;">Email Verification</h2>
                  <p>Hello!</p>
                  <p>Thank you for registering with DON-VIP.COM. To verify your email address and activate your account, please use the verification code below:</p>
                  <div style="text-align: center; margin: 30px 0;">
                    <div style="background: #f8f8f8; padding: 20px; border-radius: 6px; border: 1px solid #eee; display: inline-block;">
                      <span style="font-size: 28px; font-weight: bold; letter-spacing: 5px; color: #0066ff;">${code}</span>
                    </div>
                  </div>
                  <p>This code is valid for 30 minutes.</p>
                  <p>If you didn't register for DON-VIP.COM, please ignore this email.</p>
                  <p>Best regards,<br><strong>DON-VIP.COM Team</strong></p>
                </td>
              </tr>
              <tr>
                <td style="padding: 20px 30px; background: #f8f8f8; border-top: 1px solid #eee;">
                  <p style="font-size: 14px; color: #666;"><strong>Important:</strong> Never share this code with others.</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 20px 30px; background: #333; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
                  <p style="text-align: center; color: #fff; margin: 0;">
                    Need help? <a href="mailto:support@don-vip.com" style="color: #fff; text-decoration: underline;">support@don-vip.com</a>
                  </p>
                  <p style="text-align: center; font-size: 12px; color: #999;">© DON-VIP.COM 2025. All rights reserved.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;

    const mailOptions: nodemailer.SendMailOptions = {
      from: this.email,
      to: email,
      subject:
        lang === 'ru'
          ? 'Подтверждение email DON-VIP.COM'
          : 'Email Verification - DON-VIP.COM',
      html: emailTemplate,
    };

    await transporter.sendMail(mailOptions);

    return code;
  }
}
