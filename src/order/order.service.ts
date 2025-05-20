import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { BigoService } from '../shared/services/bigo.service';
import { ReplenishmentItem } from 'src/product/dto/create-product.dto';
import { SmileService } from 'src/shared/services/smile.service';

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    private bigoService: BigoService,
    private smileService: SmileService,
  ) {}

  async create(data: CreateOrderDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: data.product_id },
      select: {
        id: true,
        replenishment: true,
      },
    });
    if (!product) {
      throw new HttpException('Invalid product id', 400);
    }
    const replenishment =
      product.replenishment as unknown as ReplenishmentItem[];
    if (data.item_id >= replenishment.length) {
      throw new HttpException(
        'ID пакета больше чем количество пакетов в этом продукте',
        400,
      );
    }
    return await this.prisma.order.create({
      data: {
        product_id: data.product_id,
        user_id: data.user_id,
        item_id: data.item_id,
        payment: data.payment,
        account_id: data.account_id,
        server_id: data.server_id,
      },
    });
  }

  async findAll(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        skip,
        take: limit,
        orderBy: { id: 'desc' },
      }),
      this.prisma.order.count(),
    ]);

    return {
      total,
      page,
      limit,
      data,
    };
  }

  async finishOrder(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: id },
      select: {
        user_id: true,
        account_id: true,
        server_id: true,
        item_id: true,
        status: true,
        product: {
          select: {
            replenishment: true,
            type: true,
            smile_api_game: true,
          },
        },
      },
    });

    if (!order || order.status === 'Paid') {
      return order;
    }

    let replenishment: ReplenishmentItem[] = [];

    if (typeof order.product.replenishment === 'string') {
      replenishment = JSON.parse(order.product.replenishment);
    } else if (Array.isArray(order.product.replenishment)) {
      replenishment = order.product
        .replenishment as unknown as ReplenishmentItem[];
    } else {
      return order;
    }
    const item: ReplenishmentItem = replenishment[order.item_id];

    if (order.product.type === 'Bigo') {
      const result = await this.bigoService.rechargeDiamond({
        rechargeBigoId: order.account_id,
        buOrderId: `${order.user_id}${Date.now()}${Math.floor(Math.random() * 100000)}`,
        currency: 'RUB',
        value: item.amount,
        totalCost: item.price,
      });
      // if (result.message !== 'ok') {
      // }
    } else {
      await this.smileService.sendOrder(
        order.product.smile_api_game,
        item.sku,
        order.account_id,
        order.server_id,
      );
    }

    return await this.prisma.order.update({
      where: { id: id },
      data: { status: 'Paid' },
    });
  }

  async getHistory(userId: number, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where: { user_id: userId, status: 'Paid' },
        skip,
        take: limit,
        select: {
          item_id: true,
          payment: true,
          product: {
            select: {
              replenishment: true,
            },
          },
        },
      }),
      this.prisma.order.count({
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

  async findOne(id: string) {
    return await this.prisma.order.findUnique({ where: { id } });
  }

  async remove(id: string) {
    const order = await this.prisma.order.delete({ where: { id } });

    if (!order) {
      throw new HttpException('Order not found', 404);
    }

    return order;
  }
}
