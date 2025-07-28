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

  async getProductList() {
    try {
      const response = await this.donatbank.get('/product/list');

      return {
        status: response.data.status || 'success',
        message: response.data.message || '?????? ????????? ??????? ???????',
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

  async getProductInfo(productId: string) {
    try {
      const response = await this.donatbank.post('/product/info', {
        id: productId,
      });

      return {
        status: response.data.status || 'success',
        message: response.data.message || '?????????? ? ?????? ????????',
        product_info: response.data.product_info || {},
      };
    } catch (error) {
      if (error.response?.data) {
        throw new HttpException(
          error.response.data.message || 'DonatBank API error',
          error.response.status || 500,
        );
      }
      throw new HttpException('Failed to get product info', 500);
    }
  }

  async createOrder(productId: string, packageId: string, account_id: string) {
    try {
      const response = await this.donatbank.post('/order/create-order', {
        productId,
        packageId,
        quantity: 1,
        fields: {
          user_id: account_id,
          zone_id: 'ru',
        },
      });
      console.log('Order creation response:', response.data);

      return {
        status: 'success',
        message: 'Заказ успешно создан',
      };
    } catch (error) {
      if (error.response?.data) {
        throw new HttpException(
          error.response.data.message || 'DonatBank API error',
          error.response.status || 500,
        );
      }
      throw new HttpException('Failed to create order', 500);
    }
  }

  async validate(account_id: string) {
    try {
      const response = await this.donatbank.get('/v1/user/check-user', {
        params: {
          userId: account_id,
        },
      });

      return response.data;
    } catch (error) {
      if (error.response?.data) {
        throw new HttpException(
          error.response.data.message || 'DonatBank API error',
          error.response.status || 500,
        );
      }
      throw new HttpException('Failed to get product info', 500);
    }
  }
}
