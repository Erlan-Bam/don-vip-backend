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
    const order = await this.prisma.order.findUnique({ where: { id: id } });

    if (!order) {
      return order;
    }

    const product = await this.prisma.product.findUnique({
      where: { id: order.product_id },
      select: {
        replenishment: true,
        type: true,
      },
    });
    const item: ReplenishmentItem = product.replenishment[order.item_id];

    if (product.type === 'Bigo') {
      await this.bigoService.rechargeDiamond({
        rechargeBigoId: order.account_id,
        buOrderId: `${order.user_id}${Date.now()}${Math.floor(Math.random() * 100000)}`,
        currency: 'RUB',
        value: item.amount,
        totalCost: item.price,
      });
    } else {
      // await this.smileService;
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
