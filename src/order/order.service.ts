import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { BigoService } from '../shared/services/bigo.service';

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    private bigoService: BigoService,
  ) {}

  async create(data: CreateOrderDto) {
    return await this.prisma.order.create({ data: data });
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

    await this.bigoService.rechargeDiamond({
      rechargeBigoId: order.account_id,
      buOrderId: `${order.user_id}${Date.now()}${Math.floor(Math.random() * 100000)}`,
      currency: 'RUB',
      value: order.amount,
      totalCost: order.price.toNumber(),
    });

    return await this.prisma.order.update({
      where: { id: id },
      data: { status: 'Paid' },
    });
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
