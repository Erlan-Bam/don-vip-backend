import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';

@Injectable()
export class TwilioService {
  private twilioClient: Twilio;
  private phoneNumber: string;

  constructor(private configService: ConfigService) {
    const [account_sid, auth_token, phoneNumber] = [
      this.configService.get<string>('TWILIO_ACCOUNT_SID'),
      this.configService.get<string>('TWILIO_AUTH_TOKEN'),
      this.configService.get<string>('TWILIO_PHONE_NUMBER'),
    ];
    if (!account_sid || !auth_token || !phoneNumber) {
      throw new Error(
        'MISSING TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER',
      );
    }
    this.phoneNumber = phoneNumber;
    this.twilioClient = new Twilio(account_sid, auth_token);
  }

  async sendSMS(to: string, code: string, lang: 'ru' | 'en'): Promise<void> {
    try {
      const body =
        lang === 'en'
          ? `Your verification code is: ${code}\n\nThis message was sent by DON-VIP.`
          : `Ваш код подтверждения: ${code}\n\nСообщение отправлено от имени DON-VIP.`;

      await this.twilioClient.messages.create({
        body,
        from: this.phoneNumber,
        to,
      });
    } catch (error) {
      throw new HttpException('Something went wrong', 500);
    }
  }

  async sendChangePasswordSMS(
    to: string,
    link: string,
    lang: 'ru' | 'en',
  ): Promise<void> {
    try {
      const body =
        lang === 'en'
          ? `To reset your password, please follow this link:\n${link}\n\nProvided by DON-VIP.`
          : `Чтобы изменить пароль, перейдите по ссылке:\n${link}\n\nПредоставлено DON-VIP.`;

      await this.twilioClient.messages.create({
        body,
        from: this.phoneNumber,
        to,
      });
    } catch (error) {
      throw new HttpException('Something went wrong', 500);
    }
  }

  async sendSuccessSMS(to: string): Promise<void> {
    try {
      const body =
        `Thank you for your purchase!\nWe appreciate your trust.\n\n— DON-VIP\n\n` +
        `Благодарим за покупку!\nС уважением, команда DON-VIP.`;

      await this.twilioClient.messages.create({
        body,
        from: this.phoneNumber,
        to,
      });
    } catch (error) {
      throw new HttpException('Something went wrong', 500);
    }
  }
}
