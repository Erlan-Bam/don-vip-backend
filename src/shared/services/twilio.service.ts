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
      await this.twilioClient.messages.create({
        body:
          lang === 'en'
            ? `Your verification code: ${code}`
            : `Ваш код для верификации: ${code}`,
        from: this.phoneNumber,
        to: to,
      });
    } catch (error) {
      throw new HttpException('Something went wrong', 500);
    }
  }
}
