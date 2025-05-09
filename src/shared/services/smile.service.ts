import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { Axios } from 'axios';

@Injectable()
export class SmileService {
  private readonly smile: Axios;
  private apiKey: string;
  private apiVersion: string;
  private secretKey: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('SMILE_API_KEY');
    if (!apiKey) {
      throw new Error('SMILE API KEY IS NOT SET IN .ENV');
    }
    const apiVersion = this.configService.get<string>('SMILE_API_VERSION');
    if (!apiVersion) {
      throw new Error('SMILE API VERSION IS NOT SET IN .ENV');
    }
    const secretKey = this.configService.get<string>('SMILE_SECRET_KEY');
    if (!secretKey) {
      throw new Error('SMILE SECRET KEY IS NOT SET IN .ENV');
    }
    this.smile = axios.create({
      baseURL: 'https://www.smile.one/smilecode/api',
      headers: {
        'Sc-Api-Key': apiKey,
        'Sc-Api-Version': apiVersion,
      },
    });
    this.apiKey = apiKey;
    this.apiVersion = apiVersion;
    this.secretKey = secretKey;
  }

  private async generateToken(payload: any): Promise<string> {
    const header = {
      alg: 'HS256',
      typ: 'JWT',
      'sc-api-key': this.apiKey,
      'sc-api-version': this.apiVersion,
    };
    const { sign } = await import('jsonwebtoken');

    const token = sign(payload, this.secretKey, {
      algorithm: 'HS256',
      header: header,
    });

    return token;
  }

  async getProducts() {
    const id = `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
    const payload = {
      jsonrpc: this.apiVersion,
      id: id,
      method: 'productlist',
      params: {
        iat: Math.floor(Date.now() / 1000),
      },
    };
    const token = await this.generateToken(payload);
    const response = await this.smile.post('', null, {
      params: payload,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.data.result) {
      return {
        status: 'success',
        data: response.data.result.productList,
      };
    } else {
      return { status: 'error', error: response.data.error };
    }
  }
  async skuList(apiGame: string) {
    const id = `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
    const payload = {
      jsonrpc: this.apiVersion,
      id: id,
      method: 'skuList',
      params: {
        iat: Math.floor(Date.now() / 1000),
        apiGame: apiGame,
      },
    };
    const token = await this.generateToken(payload);
    const response = await this.smile.post('', null, {
      params: payload,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.data.result) {
      return {
        status: 'success',
        data: response.data.result.skuList,
      };
    } else {
      return { status: 'error', error: response.data.error };
    }
  }

  async validate(apiGame: string, user_id: string, server_id: string) {
    const id = `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
    const payload = {
      jsonrpc: this.apiVersion,
      id: id,
      method: 'validate',
      params: {
        iat: Math.floor(Date.now() / 1000),
        apiGame: apiGame,
        userAccount: {
          user_id: user_id,
          server_id: server_id,
        },
      },
    };
    const token = await this.generateToken(payload);
    const response = await this.smile.post('', null, {
      params: payload,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.data.result) {
      return {
        status: 'success',
        data: response.data.result,
      };
    } else {
      return { status: 'error', error: response.data.error };
    }
  }

  async sendOrder(apiGame: string, sku: string) {
    const list = await this.skuList(apiGame);

    if (list.status === 'success') {
      const item = list.data.find((product) => product.sku === sku);

      const id = `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
      const payload = {
        jsonrpc: this.apiVersion,
        id: id,
        method: 'skuList',
        params: {
          iat: Math.floor(Date.now() / 1000),
          apiGame: apiGame,
          items: [{ qty: 1, ...item }],
        },
      };
      const token = await this.generateToken(payload);
      const response = await this.smile.post('', null, {
        params: payload,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.result) {
        return {
          status: 'success',
          data: response.data.result.orderId,
        };
      } else {
        return { status: 'error', error: response.data.error };
      }
    } else {
      throw new HttpException('Try coming later', 400);
    }
  }
}
