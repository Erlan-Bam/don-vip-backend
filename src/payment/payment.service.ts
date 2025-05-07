import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { Axios } from 'axios';
import { PrismaService } from 'src/shared/services/prisma.service';
import * as base64 from 'base-64';
import { PagsmileCreatePayinDto } from './dto/pagsmile-create-payin.dto';
import { PagsmileNotificationDto } from './dto/pagsmile-notification.dto';
import { OrderService } from 'src/order/order.service';

@Injectable()
export class PaymentService {
  pagsmile: Axios;
  appId: string;
  secretKey: string;
  backendURL: string;
  merchantId: string;
  constructor(
    private prisma: PrismaService,
    private orderService: OrderService,
    private configService: ConfigService,
  ) {
    const backendURL =
      this.configService.get<string>('NODE_ENV') === 'production'
        ? 'https://don-vip.com'
        : 'http://localhost:6001';
    this.backendURL = backendURL;
    const baseURL =
      this.configService.get<string>('NODE_ENV') === 'production'
        ? 'https://gateway.pagsmile.com'
        : 'https://don-vip-backend-production.up.railway.app';
    this.pagsmile = axios.create({
      baseURL: baseURL,
    });
    const app_id = this.configService.get<string>('PAGSMILE_APP_ID');
    if (!app_id) {
      throw new Error('NO PAGSMILE APP ID IN .ENV');
    }
    this.appId = app_id;
    const secretKey = this.configService.get<string>('PAGSMILE_SECRET_KEY');
    if (!app_id) {
      throw new Error('NO PAGSMILE SECRET KEY IN .ENV');
    }
    this.secretKey = secretKey;
    const merchantId = this.configService.get<string>('PAGSMILE_MERCHANT_ID');
    if (!app_id) {
      throw new Error('NO PAGSMILE SECRET KEY IN .ENV');
    }
    this.merchantId = merchantId;
  }
  async createPagsmilePayin(data: PagsmileCreatePayinDto) {
    const base64 = await import('base-64');
    const { format } = await import('date-fns');
    const credentials = base64.encode(`${this.appId}:${this.secretKey}`);
    const payment = await this.pagsmile.post(
      '/trade/create',
      {
        app_id: this.appId,
        method: 'SBP',
        out_trade_no: `${data.user_id}-${data.order_id}-${Date.now()}`,
        notify_url: `${this.backendURL}/api/payment/pagsmile/success`,
        timestamp: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
        subject: 'Don Vip донат',
        order_amount: data.amount,
        order_currency: 'RUB',
        content: `Донат на сайте Don Vip на сумму: ${data.amount}`,
        buyer_id: this.merchantId,
        trade_type: 'WEB',
        return_url: 'https://don-vip.com',
        version: '2.0',
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${credentials}`,
        },
      },
    );
    return payment.data;
  }
  async pagsmileNotification(
    data: PagsmileNotificationDto,
    signature: string,
    body: Buffer,
  ) {
    const isValid = await this.verifyPagsmileSignature(
      body.toString(),
      signature,
    );

    if (!isValid) {
      console.log('INVALID NOTIFICATION');
      return 'success';
    }

    const [userId, orderId, _] = data.out_trade_no.split('-');
    console.log(userId, orderId, _);

    if (data.trade_status !== 'SUCCESS') {
      console.log('not success', data.trade_status);
      return 'success';
    }

    const order = await this.orderService.finishOrder(orderId);

    if (!order) {
      console.log('INVALID! ORDER ID NOT FOUND');
      return 'success';
    }

    return 'success';
  }
  async verifyPagsmileSignature(
    raw: string,
    signature: string,
  ): Promise<boolean> {
    const { createHmac } = await import('crypto');
    const elements = signature.split(',');
    const map: Record<string, string> = {};

    elements.forEach((element) => {
      const [key, value] = element.split('=');
      map[key] = value;
    });

    const receivedSignature = map['v2'];

    const expectedSignature = createHmac('sha256', this.secretKey)
      .update(raw)
      .digest('hex');

    console.log('Expected Signature:', expectedSignature);
    console.log('Received Signature:', receivedSignature);
    return expectedSignature === receivedSignature;
  }
}
