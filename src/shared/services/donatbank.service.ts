import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { Axios } from 'axios';

@Injectable()
export class DonatBankService {
  private readonly donatbank: Axios;
  private readonly apiKey: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('DONATBANK_API_KEY');
    if (!this.apiKey) {
      throw new HttpException('DonatBank API key not configured', 500);
    }

    this.donatbank = axios.create({
      baseURL: 'https://donatbank.com/api/v1',
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
    });
  }

  async createBalanceRequest(amount: number) {
    try {
      const response = await this.donatbank.post('/user/balance', { amount });

      return {
        status: 'success',
        paymentId: response.data.paymentId,
        paymentUrl: response.data.paymentUrl,
        message: 'Запрос на пополнение успешно создан.',
      };
    } catch (error) {
      if (error.response?.data) {
        throw new HttpException(
          error.response.data.message || 'DonatBank API error',
          error.response.status || 500,
        );
      }
      throw new HttpException('Failed to create balance request', 500);
    }
  }

  async getProductList() {
    try {
      const response = await this.donatbank.get('/product/list');

      return {
        status: response.data.status || 'success',
        message: response.data.message || 'Список доступных товаров получен',
        product_list: response.data.product_list || [],
      };
    } catch (error) {
      if (error.response?.data) {
        throw new HttpException(
          error.response.data.message || 'DonatBank API error',
          error.response.status || 500,
        );
      }
      throw new HttpException('Failed to get product list', 500);
    }
  }
}
