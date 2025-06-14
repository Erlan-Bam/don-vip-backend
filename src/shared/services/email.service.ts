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
  async sendChangePasswordEmail(toEmail: string, code: string, lang: string) {
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
              .code-box { width: 100% !important; }
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
                      <p style="margin: 0; font-size: 12px; color: #0066ff;">Донат — это просто!</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 30px;">
                      <h2 style="font-size: 24px; color: #333; text-align: center;">Восстановление пароля</h2>
                      <p>Здравствуйте!</p>
                      <p>Мы получили запрос на сброс пароля. Пожалуйста, введите код ниже, чтобы продолжить:</p>
                      <div class="code-box" style="text-align: center; margin: 30px 0;">
                        <span style="display: inline-block; font-size: 32px; letter-spacing: 6px; font-weight: bold; background: #f0f0f0; padding: 15px 25px; border-radius: 6px; border: 1px solid #ddd;">${code}</span>
                      </div>
                      <p>Код действителен в течение 24 часов.</p>
                      <p>Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.</p>
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
          <title>Password Reset - DON-VIP.COM</title>
          <style type="text/css">
            @media only screen and (max-width: 600px) {
              .main-container { width: 100% !important; }
              .code-box { width: 100% !important; }
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
                      <h1 style="font-size: 18px; color: #333; margin: 0;">DON-VIP.COM</h1>
                      <p style="font-size: 12px; color: #0066ff; margin: 0;">Money made simple</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 30px;">
                      <h2 style="font-size: 24px; color: #333; text-align: center;">Password Reset</h2>
                      <p>Hello!</p>
                      <p>We received a request to reset your password. Please enter the code below to proceed:</p>
                      <div class="code-box" style="text-align: center; margin: 30px 0;">
                        <span style="display: inline-block; font-size: 32px; letter-spacing: 6px; font-weight: bold; background: #f0f0f0; padding: 15px 25px; border-radius: 6px; border: 1px solid #ddd;">${code}</span>
                      </div>
                      <p>This code is valid for 24 hours.</p>
                      <p>If you didn’t request this, simply ignore this email.</p>
                      <p>Best regards,<br><strong>DON-VIP.COM Team</strong></p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 20px 30px; background: #f8f8f8; border-top: 1px solid #eee;">
                      <p style="font-size: 14px; color: #666;"><strong>Important:</strong> Never share this code with anyone.</p>
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
      service: 'gmail',
      auth: {
        user: this.email,
        pass: this.password,
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
      service: 'gmail',
      auth: {
        user: this.email,
        pass: this.password,
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

    const result = await transporter.sendMail(mailOptions);
    console.log(result);

    return code;
  }

  async sendSuccessMessage(toEmail: string, orderId: number) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.email,
        pass: this.password,
      },
    });

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Заказ успешно оформлен / Order Successfully Placed</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f5f5f5; color: #333333;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td style="padding: 20px 0;">
              <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);" width="100%" cellspacing="0" cellpadding="0" border="0">
  
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px 40px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold; line-height: 1.2;">
                      Заказ успешно оформлен! #${orderId}<br>
                      <span style="font-size: 24px; font-weight: normal;">Order Successfully Placed! #${orderId}</span>
                    </h1>
                  </td>
                </tr>
  
                <!-- Main Content -->
                <tr>
                  <td style="padding: 40px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                      <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#28a745" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                    </div>
  
                    <!-- Success Message -->
                    <div style="text-align: center; margin-bottom: 30px;">
                      <h2 style="font-size: 22px; color: #28a745; margin: 0 0 15px 0; font-weight: bold;">
                        Спасибо за ваш заказ!
                      </h2>
                      <h3 style="font-size: 20px; color: #28a745; margin: 0 0 20px 0; font-weight: bold;">
                        Thank you for your order!
                      </h3>
                    </div>
  
                    <!-- Payment Confirmation -->
                    <div style="background-color: #f8f9fa; border-left: 4px solid #28a745; border-radius: 6px; padding: 20px; margin: 30px 0;">
                      <p style="font-size: 16px; color: #333333; margin: 0 0 10px 0; font-weight: 600;">
                        ✅ Ваш платеж успешно обработан
                      </p>
                      <p style="font-size: 16px; color: #333333; margin: 0; font-weight: 600;">
                        ✅ Your payment has been successfully processed
                      </p>
                    </div>
  
                    <!-- Order Details -->
                    <div style="background-color: #ffffff; border: 1px solid #e9ecef; border-radius: 6px; padding: 25px; margin: 25px 0;">
                      <p style="font-size: 16px; color: #333333; margin: 0 0 15px 0; line-height: 1.5;">
                        <strong>Ваш заказ подтвержден и готов к использованию.</strong><br>
                        Все необходимые данные и инструкции отправлены на ваш email.
                      </p>
                      <p style="font-size: 16px; color: #333333; margin: 0; line-height: 1.5;">
                        <strong>Your order is confirmed and ready to use.</strong><br>
                        All necessary data and instructions have been sent to your email.
                      </p>
                    </div>
  
                    <!-- Support Information -->
                    <div style="text-align: center; margin-top: 30px;">
                      <p style="font-size: 15px; color: #666666; margin: 0 0 10px 0; line-height: 1.4;">
                        Если у вас возникли вопросы, обращайтесь в нашу службу поддержки.
                      </p>
                      <p style="font-size: 15px; color: #666666; margin: 0; line-height: 1.4;">
                        If you have any questions, feel free to contact our support team.
                      </p>
                    </div>
                  </td>
                </tr>
  
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 25px; text-align: center; border-top: 1px solid #e9ecef;">
                    <p style="font-size: 14px; color: #666666; margin: 0 0 8px 0; line-height: 1.4;">
                      &copy; 2025 DON-VIP.COM
                    </p>
                    <p style="font-size: 14px; color: #666666; margin: 0 0 15px 0; line-height: 1.4;">
                      Все права защищены / All rights reserved
                    </p>
                    <p style="font-size: 12px; color: #999999; margin: 0; line-height: 1.3;">
                      Это автоматическое письмо. Пожалуйста, не отвечайте на него.<br>
                      This is an automated email. Please do not reply.
                    </p>
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
      to: toEmail,
      subject: 'Заказ успешно оформлен / Order Successfully Placed',
      html: html,
    };

    await transporter.sendMail(mailOptions);
  }

  async sendPUBGCode(email: string, code: string, expire_time: string) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.email,
        pass: this.password,
      },
    });

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Ваш код PUBG / Your PUBG Code</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f5f5f5; color: #333333;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr>
          <td style="padding: 20px 0;">
            <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);" width="100%" cellspacing="0" cellpadding="0" border="0">

              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #1c34ff 0%, #1c34ffcc 100%); padding: 30px 40px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Ваш код PUBG / Your PUBG Code</h1>
                </td>
              </tr>

              <!-- Main Content -->
              <tr>
                <td style="padding: 40px;">
                  <p style="font-size: 16px; color: #555555; margin-bottom: 10px;">
                    <span style="display: block; margin-bottom: 8px;">Спасибо за вашу покупку. Вот ваш код активации PUBG:</span>
                    <span style="display: block; color: #777777;">Thank you for your purchase. Here is your PUBG redemption code:</span>
                  </p>

                  <div style="background-color: #f8f8f8; border: 1px dashed #1c34ff; border-radius: 6px; padding: 20px; margin: 30px 0; text-align: center;">
                    <p style="margin: 0 0 10px; font-size: 14px; color: #777777;">
                      <span style="display: block; margin-bottom: 5px;">Ваш код:</span>
                      <span style="display: block;">Your Code:</span>
                    </p>
                    <p style="font-family: 'Courier New', monospace; font-size: 24px; font-weight: bold; color: #1c34ff; margin: 0; letter-spacing: 1px;">${code}</p>
                  </div>

                  <div style="background-color: #fff8f5; border-left: 4px solid #f03d00; padding: 15px; margin: 25px 0;">
                    <p style="font-size: 15px; color: #555555; margin: 0;">
                      <span style="display: block; margin-bottom: 8px;">
                        <strong>Примечание:</strong> Срок действия этого кода истекает <strong>${expire_time}</strong>. Пожалуйста, активируйте его до указанного срока.
                      </span>
                      <span style="display: block; color: #777777;">
                        <strong>Note:</strong> This code will expire on <strong>${expire_time}</strong>. Please redeem it before the deadline.
                      </span>
                    </p>
                  </div>

                  <div style="text-align: center; margin: 30px 0;">
                    <a href="https://www.midasbuy.com/midasbuy/ae/redeem/pubgm" target="_blank" style="display: inline-block; background-color: #1c34ff; color: #ffffff; text-decoration: none; font-weight: bold; padding: 14px 30px; border-radius: 50px; font-size: 16px;">
                      Активировать / Redeem Now
                    </a>
                  </div>

                  <p style="font-size: 16px; color: #555555;">
                    <span style="display: block; margin-bottom: 8px;">Если у вас возникли вопросы, обращайтесь в нашу службу поддержки.</span>
                    <span style="display: block; color: #777777;">If you have any questions, feel free to contact our support team.</span>
                  </p>
                </td>
              </tr>

              <tr>
                <td style="background-color: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
                  <p style="font-size: 14px; color: #777777; margin: 0 0 5px;">
                    &copy; 2025 DON-VIP.COM. Все права защищены / All rights reserved.
                  </p>
                  <p style="font-size: 12px; color: #999999; margin: 0;">
                    <span style="display: block; margin-bottom: 3px;">Это автоматическое письмо. Пожалуйста, не отвечайте на него.</span>
                    <span style="display: block;">This is an automated email. Please do not reply.</span>
                  </p>
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
      subject: 'Ваш код PUBG готов / Your PUBG Code is Ready',
      html,
    };

    await transporter.sendMail(mailOptions);
  }
}
