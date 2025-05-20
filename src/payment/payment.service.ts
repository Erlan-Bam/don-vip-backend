import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { Axios } from 'axios';
import { PrismaService } from 'src/shared/services/prisma.service';
import { PagsmileCreatePayinDto } from './dto/pagsmile-create-payin.dto';
import { PagsmileNotificationDto } from './dto/pagsmile-notification.dto';
import { OrderService } from 'src/order/order.service';
import { TBankWebhookDto } from './dto/tbank-webhook.dto';
import { Response } from 'express';

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
        ? 'https://don-vip.online/api'
        : 'http://localhost:6001';
    this.backendURL = backendURL;
    const baseURL =
      this.configService.get<string>('NODE_ENV') === 'production'
        ? 'https://gateway.pagsmile.com'
        : 'https://gateway-test.pagsmile.com';
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
        out_trade_no: `${data.user_id}:${data.order_id}:${Date.now()}`,
        notify_url: `${this.backendURL}/api/payment/pagsmile/notification`,
        timestamp: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
        subject: 'Don Vip донат',
        order_amount: data.amount,
        order_currency: 'RUB',
        content: `Донат на сайте Don Vip на сумму: ${data.amount}`,
        buyer_id: this.merchantId,
        trade_type: 'WEB',
        return_url: 'https://don-vip.online/ru/payment/success',
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
    body: string,
  ) {
    const isValid = await this.verifyPagsmileSignature(body, signature);

    if (!isValid) {
      console.log('INVALID NOTIFICATION');
      return 'success';
    }

    const [userId, orderIdStr, _] = data.out_trade_no.split(':');
    const orderId = parseInt(orderIdStr);

    const allowedStatus = [
      'SUCCESS',
      'CANCEL',
      'EXPIRED',
      'REFUSED',
      'REFUSE_FAILED',
    ];

    if (data.trade_status && allowedStatus.includes(data.trade_status)) {
      await this.prisma.payment.create({
        data: {
          price: data.amount,
          method: data.method,
          order_id: orderId,
          user_id: Number(userId),
          status: data.trade_status !== 'SUCCESS' ? 'Cancelled' : 'Paid',
        },
      });
    }

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
  async tbankWebhook(data: TBankWebhookDto, res: Response) {
    const allowedStatus = [
      'IN_PROGRESS',
      'EXECUTED',
      'FAILED',
      'CANCELLED',
      'CONFIRMED',
    ];
    const [orderIdStr, userId] = data.OrderId.split('_');
    const orderId = parseInt(orderIdStr);

    if (data.Status !== 'CONFIRMED') {
      console.log('not success', data.Status);
      return res.json({ message: 'ok' }).status(200);
    }

    const order = await this.orderService.finishOrder(orderId);

    if (!order) {
      console.log('INVALID! ORDER ID NOT FOUND');
      return res.json({ message: 'ok' }).status(200);
    }

    if (data.Status && allowedStatus.includes(data.Status)) {
      await this.prisma.payment.create({
        data: {
          price: data.Amount,
          method: 'T-Bank',
          order_id: orderId,
          user_id: Number(userId),
          status: data.Status === 'CONFIRMED' ? 'Paid' : 'Cancelled',
        },
      });
    }

    return res.json({ message: 'ok' }).status(200);
  }

  async getHistory(userId: number, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.payment.findMany({
        where: { user_id: userId, status: 'Paid' },
        skip,
        take: limit,
      }),
      this.prisma.payment.count({
        where: { user_id: userId, status: 'Paid' },
      }),
    ]);

    return {
      total,
      page,
      limit,
      data,
    };
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
      map[key.trim()] = value.trim();
    });

    const receivedSignature = map['v2'];

    const expectedSignature = createHmac('sha256', this.secretKey)
      .update(raw)
      .digest('hex');

    return expectedSignature === receivedSignature;
  }
}
