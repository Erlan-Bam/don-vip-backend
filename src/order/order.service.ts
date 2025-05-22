import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { BigoService } from '../shared/services/bigo.service';
import { ReplenishmentItem } from 'src/product/dto/create-product.dto';
import { SmileService } from 'src/shared/services/smile.service';
import { subYears, startOfYear } from 'date-fns';

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

  async getAllForAdmin(page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (search) {
      const numericSearch = Number(search);

      whereClause.OR = [
        { account_id: { contains: search, mode: 'insensitive' } },
        { server_id: { contains: search, mode: 'insensitive' } },
        {
          user: {
            OR: [
              { first_name: { contains: search, mode: 'insensitive' } },
              { last_name: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
        // 👇 Add numeric ID matching (orderId, itemId, etc.)
        ...(Number.isInteger(numericSearch) && numericSearch > 0
          ? [
              { id: numericSearch }, // order.id
              { item_id: numericSearch }, // item_id
              { product_id: numericSearch }, // product_id
            ]
          : []),
      ];
    }

    const [orders, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        skip,
        take: limit,
        where: whereClause,
        orderBy: {
          created_at: 'desc',
        },
        include: {
          product: true,
          payments: {
            where: { status: 'Paid' },
            orderBy: { created_at: 'desc' },
            take: 1,
            select: {
              price: true,
              method: true,
              created_at: true,
            },
          },
          user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              phone: true,
            },
          },
        },
      }),
      this.prisma.order.count({ where: whereClause }),
    ]);

    const formattedData = orders.map((order) => {
      const product = order.product;
      const payment = order.payments[0];

      let replenishment = { amount: 0, price: 0 };
      try {
        const parsed = Array.isArray(product.replenishment)
          ? product.replenishment
          : JSON.parse(product.replenishment as any);
        replenishment = parsed[order.item_id] || parsed[0] || replenishment;
      } catch (err) {}

      return {
        orderId: order.id,
        itemId: order.item_id,
        productId: order.product_id,
        user: order.user,
        date:
          payment?.created_at?.toLocaleDateString() ??
          order.created_at.toLocaleDateString(),
        time:
          payment?.created_at?.toLocaleTimeString() ??
          order.created_at.toLocaleTimeString(),
        gameImage: product.image,
        currencyImage: product.currency_image ?? '/diamond.png',
        status: order.status,
        playerId: order.account_id ?? 'N/A',
        serverId: order.server_id ?? 'N/A',
        diamonds: replenishment.amount,
        price: payment
          ? `${(payment.price.toNumber() / 100).toFixed(2)}₽`
          : '—',
        method: payment?.method ?? '—',
      };
    });

    return {
      total,
      page,
      limit,
      data: formattedData,
    };
  }

  async getAnalytics() {
    const totalOrders = await this.prisma.order.count();

    const totalRevenue = await this.prisma.payment.aggregate({
      where: { status: 'Paid' },
      _sum: {
        price: true,
      },
    });

    const packagesCount = await this.prisma.order.groupBy({
      by: ['product_id'],
      _count: {
        product_id: true,
      },
      orderBy: {
        _count: {
          product_id: 'desc',
        },
      },
    });

    const productDetails = await this.prisma.product.findMany({
      where: {
        id: {
          in: packagesCount.map((item) => item.product_id),
        },
      },
      select: {
        id: true,
        name: true,
        type: true,
      },
    });

    const productMap = new Map(productDetails.map((p) => [p.id, p]));

    return {
      totalOrders,
      totalRevenue: totalRevenue._sum.price,
      packages: packagesCount.map((item) => ({
        productId: item.product_id,
        name: productMap.get(item.product_id)?.name,
        type: productMap.get(item.product_id)?.type,
        count: item._count.product_id,
      })),
    };
  }

  async getMonthlySalesOverview() {
    const now = new Date();
    const startOfCurrentYear = new Date(now.getFullYear(), 0, 1);

    const payments = await this.prisma.payment.findMany({
      where: {
        status: 'Paid',
        created_at: {
          gte: startOfCurrentYear,
        },
      },
      select: {
        price: true,
        created_at: true,
      },
    });

    const monthlyData: { [key: string]: { total: number; count: number } } = {};

    for (let i = 0; i < 12; i++) {
      const monthKey = `${now.getFullYear()}-${String(i + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = { total: 0, count: 0 };
    }

    for (const payment of payments) {
      const date = new Date(payment.created_at);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (monthlyData[key]) {
        monthlyData[key].total += Number(payment.price);
        monthlyData[key].count += 1;
      }
    }

    const result = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      totalRevenue: data.total,
      totalOrders: data.count,
    }));

    return result;
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

  async finishOrder(id: any) {
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
      return null;
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
      if (result.message !== 'ok') {
        await this.smileService.sendBigo(
          order.account_id,
          item.amount.toString(),
        );
      }
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

    const [orders, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
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
          product: true, // Get full product info
          payments: {
            where: { status: 'Paid' },
            orderBy: { created_at: 'desc' },
            take: 1, // Most recent paid payment
          },
        },
      }),
      this.prisma.order.count({
        where: {
          user_id: userId,
          status: 'Paid',
        },
      }),
    ]);

    const formattedData = orders.map((order) => {
      const product = order.product;
      const payment = order.payments[0]; // Get the first (most recent) paid payment
      const replenishment = Array.isArray(product.replenishment)
        ? product.replenishment[0]
        : JSON.parse(product.replenishment as any)[0];

      return {
        id: order.item_id,
        date:
          payment?.created_at?.toLocaleDateString() ??
          order.created_at.toLocaleDateString(),
        time:
          payment?.created_at?.toLocaleTimeString() ??
          order.created_at.toLocaleTimeString(),
        gameImage: product.image,
        currencyImage: product.currency_image ?? '/diamond.png',
        status: 'success', // or map from order.status
        playerId: order.account_id ?? 'N/A',
        serverId: order.server_id ?? 'N/A',
        diamonds: replenishment.amount,
        price: payment ? `${payment.price.toFixed(0)}₽` : '—',
      };
    });

    return {
      total,
      page,
      limit,
      data: formattedData,
    };
  }

  async findOne(id: any) {
    return await this.prisma.order.findUnique({ where: { id } });
  }

  async remove(id: any) {
    const order = await this.prisma.order.delete({ where: { id } });

    if (!order) {
      throw new HttpException('Order not found', 404);
    }

    return order;
  }
}
