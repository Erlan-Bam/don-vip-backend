import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { CheckCouponDto } from './dto/check-coupon.dto';
import { ApplyCouponDto } from './dto/apply-coupon.dto';

@Injectable()
export class CouponService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateCouponDto) {
    const { gameIds, ...couponData } = data;

    return this.prisma.coupon.create({
      data: {
        ...couponData,
        products: gameIds
          ? {
              connect: gameIds.map((id) => ({ id })),
            }
          : undefined,
      },
    });
  }

  async update(data: UpdateCouponDto) {
    return await this.prisma.coupon.update({
      where: { id: data.id },
      data: {
        code: data.code,
        limit: data.limit,
        discount: data.discount,
      },
    });
  }

  async check(data: CheckCouponDto) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: data.code },
    });

    if (!coupon) {
      throw new HttpException('Invalid code', 404);
    }

    if (coupon.status !== 'Active') {
      throw new HttpException('Coupon is not active', 400);
    }

    return {
      code: coupon.code,
      limit: coupon.limit,
      discount: coupon.discount,
      status: coupon.status,
    };
  }

  async applyCoupon(dto: ApplyCouponDto) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: dto.code },
      include: {
        products: true,
      },
    });

    if (!coupon) {
      throw new HttpException('Invalid code', 404);
    }

    if (coupon.status !== 'Active') {
      throw new HttpException('Coupon is not active', 400);
    }

    if (coupon.limit !== null && coupon.limit <= 0) {
      await this.prisma.coupon.update({
        where: { id: coupon.id },
        data: { status: 'Expired' },
      });
      throw new HttpException('Coupon expired', 400);
    }

    const alreadyUsed = await this.prisma.usedCoupon.findFirst({
      where: {
        user_id: dto.user_id,
        coupon_id: coupon.id,
      },
    });

    if (alreadyUsed) {
      throw new HttpException('You already used this coupon', 400);
    }

    const alreadyActive = await this.prisma.activeCoupon.findFirst({
      where: {
        user_id: dto.user_id,
        coupon_id: coupon.id,
      },
    });

    if (alreadyActive) {
      throw new HttpException('Coupon is already active for this user', 400);
    }

    // Save usage
    await this.prisma.usedCoupon.create({
      data: {
        user_id: dto.user_id,
        coupon_id: coupon.id,
      },
    });

    // Add to active coupons
    await this.prisma.activeCoupon.create({
      data: {
        user_id: dto.user_id,
        coupon_id: coupon.id,
      },
    });

    // Decrease limit
    if (coupon.limit !== null) {
      await this.prisma.coupon.update({
        where: { id: coupon.id },
        data: {
          limit: { decrement: 1 },
        },
      });
    }

    // Build discounted product info
    const discountedProducts = coupon.products.map((product) => {
      type ReplenishmentItem = { price: number };

      const replenishmentData = product.replenishment as ReplenishmentItem[];
      const originalPrice = replenishmentData?.[0]?.price;

      return {
        id: product.id,
        name: product.name,
        originalPrice,
        image: product.image,
        discountedPrice:
          typeof originalPrice === 'number'
            ? originalPrice * (1 - coupon.discount / 100)
            : null,
      };
    });

    return {
      message: 'Coupon applied successfully',
      code: coupon.code,
      discount: coupon.discount,
      discountedGames: discountedProducts,
      products: coupon.products,
    };
  }

  async getCoupons() {
    return await this.prisma.coupon.findMany();
  }

  async delete(id: number) {
    const coupon = await this.prisma.coupon.delete({ where: { id } });

    if (!coupon) {
      throw new HttpException('Coupon not found', 404);
    }

    return coupon;
  }
}
