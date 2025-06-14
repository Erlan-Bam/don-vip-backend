import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UniClient } from 'uni-sdk';

@Injectable()
export class UnimatrixService {
  private client: UniClient;

  constructor(private configService: ConfigService) {
    const [accessKeyId] = [
      this.configService.get<string>('UNIMTX_ACCESS_KEY_ID'),
    ];
    if (!accessKeyId) {
      throw new Error('MISSING UNIMTX_ACCESS_KEY_ID IN ENVIRONMENT VARIABLES');
    }
    this.client = new UniClient({
      accessKeyId: accessKeyId,
    });
  }

  async sendSMS(to: string, code: string, lang: 'ru' | 'en'): Promise<void> {
    try {
      await this.client.otp.send({
        digits: 5,
        to: to,
        templateId: lang === 'en' ? 'pub_otp_en_basic2' : 'pub_otp_ru',
        channel: 'sms',
        code: code,
        signature: 'DON-VIP',
      });
    } catch (error) {
      console.log(error);
      throw new HttpException('Something went wrong', 500);
    }
  }

  async sendChangePasswordSMS(
    to: string,
    code: string,
    lang: 'ru' | 'en',
  ): Promise<void> {
    try {
      await this.client.otp.send({
        digits: 5,
        to: to,
        templateId:
          lang === 'en' ? 'pub_otp_en_reset_pass' : 'pub_otp_ru_security',
        channel: 'sms',
        code: code,
        signature: 'DON-VIP',
      });
    } catch (error) {
      throw new HttpException('Something went wrong', 500);
    }
  }

  async sendSuccessSMS(to: string, orderId: number): Promise<void> {
    try {
      const result = await this.client.messages.send({
        templateId: 'successful_purchase',
        templateData: {
          order_number_en: orderId,
          order_number_ru: orderId,
        },
        signature: 'DON-VIP',
        to: to,
      });
      console.log(result);
    } catch (error) {
      console.log(error);
      throw new HttpException('Something went wrong', 500);
    }
  }
}
