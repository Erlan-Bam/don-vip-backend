import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { Axios } from 'axios';
import { PrismaService } from 'src/shared/services/prisma.service';
import { PagsmileCreatePayinDto } from './dto/pagsmile-create-payin.dto';
import { PagsmileNotificationDto } from './dto/pagsmile-notification.dto';
import { OrderService } from 'src/order/order.service';
import { TBankWebhookDto } from './dto/tbank-webhook.dto';
import { DonatBankBalanceDto } from './dto/donatbank-balance.dto';
import { DonatBankService } from 'src/shared/services/donatbank.service';
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
    private donatBankService: DonatBankService,
  ) {
    const backendURL =
      this.configService.get<string>('NODE_ENV') === 'production'
        ? 'https://api.don-vip.com'
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
    const bank = await this.prisma.bank.findUnique({
      where: { name: data.name },
    });
    if (!bank) {
      throw new HttpException(`Bank ${data.name} not found`, 404);
    }
    if (!bank.isActive) {
      throw new HttpException(`Bank ${data.name} is not active`, 400);
    }
    const base64 = await import('base-64');
    const { format } = await import('date-fns');
    const credentials = base64.encode(`${this.appId}:${this.secretKey}`);
    const payment = await this.pagsmile.post(
      '/trade/create',
      {
        app_id: this.appId,
        method: data.name === 'SBP' ? 'SBP' : '',
        out_trade_no: `${data.user_id || 'unknown'}:${data.order_id}:${Date.now()}`,
        notify_url: `${this.backendURL}/api/payment/pagsmile/notification`,
        timestamp: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
        subject: 'Don Vip донат',
        order_amount: data.amount,
        order_currency: 'RUB',
        content: `Донат на сайте Don Vip на сумму: ${data.amount}`,
        buyer_id: this.merchantId,
        trade_type: 'WEB',
        return_url: 'https://don-vip.com/payment/success',
        version: '2.0',
        regions: ['RUS'],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${credentials}`,
        },
      },
    );
    if (payment.data.web_url) {
      payment.data.web_url += `&return_url=${encodeURIComponent('https://don-vip.com/payment/success')}`;
    }
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
          order_id: orderId as any,
          user_id: userId === 'unknown' ? undefined : Number(userId),
          status: data.trade_status !== 'SUCCESS' ? 'Cancelled' : 'Paid',
        },
      });
      if (data.trade_status !== 'SUCCESS') {
        await this.prisma.order.update({
          where: { id: orderId },
          data: { status: 'Cancelled' },
        });
      }
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
    const [orderIdStr, userId] = data.OrderId.split('_');
    const orderId = parseInt(orderIdStr, 10);

    const orderStatus = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: { status: true },
    });
    if (orderStatus.status === 'Paid') {
      return res.json({ message: 'ok' }).status(200);
    }

    const allowedStatus = ['REJECTED', 'CONFIRMED'];

    if (data.Status && allowedStatus.includes(data.Status)) {
      await this.prisma.payment.create({
        data: {
          price: data.Amount,
          method: 'T-Bank',
          order_id: orderId,
          user_id: userId === 'unknown' ? undefined : Number(userId),
          status: data.Status === 'CONFIRMED' ? 'Paid' : 'Cancelled',
        },
      });
      if (data.Status === 'REJECTED') {
        await this.prisma.order.update({
          where: { id: orderId },
          data: { status: 'Cancelled' },
        });
      }
    }

    if (data.Status !== 'CONFIRMED') {
      return res.json({ message: 'ok' }).status(200);
    }

    const order = await this.orderService.finishOrder(orderId);

    if (!order) {
      console.log('INVALID! ORDER ID NOT FOUND');
      return res.json({ message: 'ok' }).status(200);
    }

    return res.json({ message: 'ok' }).status(200);
  }

  async getHistory(userId: number, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.payment.findMany({
        where: {
          user_id: userId,
          status: 'Paid',
        },
        skip,
        take: limit,
        orderBy: {
          created_at: 'desc',
        },
        include: {
          order: {
            include: {
              product: true,
            },
          },
        },
      }),
      this.prisma.payment.count({
        where: { user_id: userId, status: 'Paid' },
      }),
    ]);

    const formattedData = data.map((payment) => {
      const order = payment.order;
      const product = order.product;
      const replenishment = Array.isArray(product.replenishment)
        ? product.replenishment[0]
        : JSON.parse(product.replenishment as any)[0];

      return {
        id: order.item_id,
        date: payment.created_at.toLocaleDateString(),
        time: payment.created_at.toLocaleTimeString(),
        gameImage: product.image,
        method: payment.method,
        currencyImage: product.currency_image ?? '/diamond.png',
        status: 'success', // or map from order.status if needed
        playerId: order.account_id ?? 'N/A',
        serverId: order.server_id ?? 'N/A',
        diamonds: replenishment.amount,
        price: `${payment.price.toFixed(0)}₽`,
      };
    });

    return {
      total,
      page,
      limit,
      data: formattedData,
    };
  }

  async createDonatBankBalanceRequest(amount: number) {
    return this.donatBankService.createBalanceRequest(amount);
  }

  async handleDonatBankWebhook(orderId: string, status: string) {
    try {
      // Find the order by DonatBank order ID
      const order = await this.prisma.order.findFirst({
        where: {
          donatbank_order_id: orderId, // Use the dedicated field
        },
        include: { product: true, user: true },
      });

      if (!order) {
        throw new HttpException('Order not found', 404);
      }

      // Check if payment is successful
      if (status === 'SUCCESS' || status === 'PAID') {
        // Create payment record
        await this.prisma.payment.create({
          data: {
            price: 0, // Will be updated with actual price if available
            method: 'DonatBank',
            order_id: order.id,
            user_id: order.user_id,
            status: 'Paid',
          },
        });

        // Update order status to Paid
        // Note: DonatBank currently doesn't have delivery endpoints or webhooks
        // This will need to be implemented when they add these features
        await this.prisma.order.update({
          where: { id: order.id },
          data: {
            status: 'Paid',
            response: {
              ...(order.response as any),
              webhook_status: status,
              processed_at: new Date().toISOString(),
            },
          },
        });
      } else if (status === 'CANCELLED' || status === 'FAILED') {
        // Create cancelled payment record
        await this.prisma.payment.create({
          data: {
            price: 0,
            method: 'DonatBank',
            order_id: order.id,
            user_id: order.user_id,
            status: 'Cancelled',
          },
        });

        // Update order status
        await this.prisma.order.update({
          where: { id: order.id },
          data: { status: 'Cancelled' },
        });
      }

      return { status: 'success', message: 'Webhook processed successfully' };
    } catch (error) {
      console.error('DonatBank webhook error:', error);
      throw new HttpException('Failed to process webhook', 500);
    }
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
