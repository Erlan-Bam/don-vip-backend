import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { BigoService } from '../shared/services/bigo.service';
import { ReplenishmentItem } from 'src/product/dto/create-product.dto';
import { SmileService } from 'src/shared/services/smile.service';
import { EmailService } from 'src/shared/services/email.service';
import { UnimatrixService } from 'src/shared/services/unimatrix.service';
import { DonatBankService } from 'src/shared/services/donatbank.service';

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    private bigoService: BigoService,
    private smileService: SmileService,
    private emailService: EmailService,
    private unimatrixService: UnimatrixService,
    private donatBankService: DonatBankService,
  ) {}

  async create(data: CreateOrderDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: data.product_id },
      select: {
        id: true,
        replenishment: true,
        type: true,
      },
    });
    if (!product) {
      throw new HttpException('Invalid product id', 400);
    }

    const replenishment =
      product.replenishment as unknown as ReplenishmentItem[];
    if (data.item_id >= replenishment.length) {
      console.log('did not work because item_id is out of range');
      throw new HttpException('ID OUT OF RANGE', 400);
    }

    const coupon = await this.prisma.coupon.findFirst({
      where: { code: data.coupon_code },
      select: { id: true, status: true },
    });

    return await this.prisma.order.create({
      data: {
        identifier: data.identifier,
        product_id: data.product_id,
        user_id: data.user_id,
        item_id: data.item_id,
        payment: data.payment,
        account_id: data.account_id,
        server_id: data.server_id,
        coupon_id: coupon && coupon.status === 'Active' ? coupon.id : null,
      },
    });
  }

  async createDonatBankOrder(data: {
    identifier: string;
    product_id: number;
    user_id?: number;
    productId: string;
    packageId: string;
    quantity: number;
    fields: Record<string, any>;
  }) {
    return await this.prisma.order.create({
      data: {
        identifier: data.identifier,
        product_id: data.product_id,
        user_id: data.user_id,
        item_id: 0, // Not applicable for DonatBank
        payment: 'DonatBank',
        account_id: data.fields.user_id || null,
        server_id: data.fields.zone_id || null,
        response: {
          productId: data.productId,
          packageId: data.packageId,
          quantity: data.quantity,
          fields: data.fields,
        },
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
        // ?? Add numeric ID matching (orderId, itemId, etc.)
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

    const formattedData = orders.flatMap((order) => {
      const product = order.product;
      const payment = order.payments[0];

      let parsed: ReplenishmentItem[];
      try {
        parsed = Array.isArray(product.replenishment)
          ? (product.replenishment as any)
          : (JSON.parse(product.replenishment as any) as ReplenishmentItem[]);
      } catch (err) {
        console.error(
          `Error parsing replenishment for order ${order.id}:`,
          order,
          err,
        );
        return [];
      }

      const replenishment = parsed[order.item_id];
      if (!replenishment) {
        return [];
      }
      let price = replenishment.price || 0;
      if (payment?.price) {
        if (payment.method === 'T-Bank') {
          price = payment.price.toNumber() / 100;
        } else {
          price = payment.price.toNumber();
        }
      }

      return {
        orderId: order.id,
        itemId: order.item_id,
        productId: order.product_id,
        user: order.user,
        date: order.created_at.toLocaleDateString('ru-RU', {
          timeZone: 'Europe/Moscow',
        }),
        time: order.created_at.toLocaleTimeString('ru-RU', {
          timeZone: 'Europe/Moscow',
        }),
        gameImage: product.image,
        currencyImage: product.currency_image ?? '/diamond.png',
        status: order.status,
        playerId: order.account_id ?? 'N/A',
        serverId: order.server_id ?? 'N/A',
        diamonds: replenishment.amount,
        response: order.response ?? '�',
        price: `${price}`,
        method: payment?.method ?? order.payment,
        product: {
          id: product.id,
          name: product.name,
          type: product.type,
          image: product.image,
          currencyImage: product.currency_image,
          replenishment: product.replenishment,
        },
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
    const now = new Date();
    const startOfCurrentYear = new Date(now.getFullYear(), 0, 1);
    const [orders, totalOrders] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where: {
          status: 'Paid',
          created_at: {
            gte: startOfCurrentYear,
          },
        },
        select: {
          item_id: true,
          created_at: true,
          product: {
            select: {
              replenishment: true,
            },
          },
        },
      }),
      this.prisma.order.count(),
    ]);
    const totalRevenue = orders.reduce((acc, order) => {
      let replenishment = { amount: 0, price: 0 };

      try {
        const parsed = Array.isArray(order.product.replenishment)
          ? order.product.replenishment
          : JSON.parse(order.product.replenishment as any);

        if (parsed && parsed[order.item_id]) {
          replenishment = parsed[order.item_id];
        }
      } catch (err) {
        console.log('Error when parsing replenishment in getAllForAdmin', err);
      }

      return acc + (replenishment.price || 0);
    }, 0);

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
      totalRevenue: totalRevenue,
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

    const orders = await this.prisma.order.findMany({
      where: {
        status: 'Paid',
        created_at: {
          gte: startOfCurrentYear,
        },
      },
      select: {
        item_id: true,
        created_at: true,
        product: {
          select: {
            replenishment: true,
          },
        },
      },
    });

    const monthlyData: { [key: string]: { total: number; count: number } } = {};

    for (let i = 0; i < 12; i++) {
      const monthKey = `${now.getFullYear()}-${String(i + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = { total: 0, count: 0 };
    }

    for (const order of orders) {
      const date = new Date(order.created_at);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (monthlyData[key]) {
        let replenishment = { amount: 0, price: 0 };
        try {
          const parsed = Array.isArray(order.product.replenishment)
            ? order.product.replenishment
            : JSON.parse(order.product.replenishment as any);
          replenishment = parsed[order.item_id];
        } catch (err) {
          console.log(
            'Error when parsing replenishment in getAllForAdmin',
            err,
          );
        }
        if (replenishment) {
          monthlyData[key].total += replenishment.price;
          monthlyData[key].count += 1;
        }
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
        id: true,
        identifier: true,
        user_id: true,
        account_id: true,
        server_id: true,
        item_id: true,
        status: true,
        response: true,
        product: {
          select: {
            donatbank_product_id: true,
            replenishment: true,
            type: true,
            smile_api_game: true,
          },
        },
        coupon: {
          select: {
            id: true,
            limit: true,
            status: true,
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
    let response: {
      type: string;
      message: string;
    };
    if (order.product.type === 'DonatBank') {
      const result = await this.donatBankService.createOrder(
        order.product.donatbank_product_id,
        item.sku,
        order.account_id,
      );

      response = {
        type: 'donatbank',
        message: result.message,
      };
    } else {
      if (order.product.type === 'Bigo') {
        const result = await this.bigoService.rechargeDiamond({
          rechargeBigoId: order.account_id,
          buOrderId: `${order.user_id}${Date.now()}${Math.floor(Math.random() * 100000)}`,
          currency: 'RUB',
          value: item.amount,
          totalCost: item.price,
        });
        response = {
          type: 'bigo',
          message: result.message,
        };
        if (result.message !== 'ok') {
          await this.smileService.sendBigo(
            order.account_id,
            item.amount.toString(),
          );
        }
      } else {
        const result = await this.smileService.sendOrder(
          order.product.smile_api_game,
          item.sku,
          order.account_id,
          order.server_id,
        );
        if (result.status === 'success') {
          response = {
            type: 'smile',
            message: 'success',
          };
        } else {
          response = {
            type: 'smile',
            message: result.error,
          };
        }
      }
    }

    if (order.coupon && order.coupon.status === 'Active') {
      if (order.coupon.limit !== null && order.coupon.limit > 0) {
        await this.prisma.coupon.update({
          where: { id: order.coupon.id },
          data: {
            limit: { decrement: 1 },
          },
        });
      } else if (order.coupon.limit === 0) {
        await this.prisma.coupon.delete({ where: { id: order.coupon.id } });
      }
    }
    await this.prisma.order.update({
      where: { id: id },
      data: {
        status: 'Paid',
        response: JSON.stringify(response),
      },
    });

    if (order.identifier.includes('@')) {
      await this.emailService.sendSuccessMessage(order.identifier, order.id);
    } else {
      await this.unimatrixService.sendSuccessSMS(order.identifier, order.id);
    }

    return { status: 'success', message: 'Order finished successfully' };
  }

  async getHistory(userId: number, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [orders, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where: {
          user_id: userId,
        },
        skip,
        take: limit,
        orderBy: {
          created_at: 'desc',
        },
        select: {
          id: true,
          item_id: true,
          created_at: true,
          account_id: true,
          server_id: true,
          response: true,
          status: true,
          payments: {
            orderBy: { created_at: 'desc' },
            take: 1,
          },
          product: {
            select: {
              id: true,
              name: true,
              type: true,
              image: true,
              currency_image: true,
              replenishment: true,
            },
          },
        },
      }),
      this.prisma.order.count({
        where: {
          user_id: userId,
        },
      }),
    ]);

    const formattedData = orders.map((order) => {
      const product = order.product;
      const payment = order.payments[0];
      const replenishment = Array.isArray(product.replenishment)
        ? product.replenishment[order.item_id]
        : JSON.parse(product.replenishment as any)[order.item_id];

      return {
        id: order.id,
        date:
          payment?.created_at?.toLocaleDateString() ??
          order.created_at.toLocaleDateString(),
        gameImage: product.image,
        productName: product.name,
        currencyImage: product.currency_image,
        status: order.status,
        playerId: order.account_id,
        diamonds: replenishment.amount,
        response: order.response,
        price: `${replenishment.price}?`,
        ...(order.server_id !== undefined && { serverId: order.server_id }),
        payment: payment,
        product: {
          id: product.id,
          name: product.name,
          type: product.type,
        },
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
