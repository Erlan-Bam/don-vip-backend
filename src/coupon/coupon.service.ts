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
    return await this.prisma.coupon.create({ data });
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

    if (coupon.limit !== null && coupon.limit <= 0) {
      if (coupon.status !== 'Expired') {
        await this.prisma.coupon.update({
          where: { code: data.code },
          data: { status: 'Expired' },
        });
      }
      throw new HttpException('Expired code', 400);
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

    // Проверка: использовал ли уже пользователь этот купон
    const alreadyUsed = await this.prisma.usedCoupon.findFirst({
      where: {
        user_id: dto.user_id,
        coupon_id: coupon.id,
      },
    });

    if (alreadyUsed) {
      throw new HttpException('You already used this coupon', 400);
    }

    // Проверка: есть ли активный купон у пользователя
    const user = await this.prisma.user.findUnique({
      where: { id: dto.user_id },
      select: { active_coupon_id: true },
    });

    if (user?.active_coupon_id) {
      throw new HttpException('User already has an active coupon', 400);
    }

    // Сохраняем факт использования
    await this.prisma.usedCoupon.create({
      data: {
        user_id: dto.user_id,
        coupon_id: coupon.id,
      },
    });

    // Уменьшаем лимит (если есть)
    if (coupon.limit !== null) {
      await this.prisma.coupon.update({
        where: { id: coupon.id },
        data: {
          limit: { decrement: 1 },
        },
      });
    }

    // Применяем скидку и устанавливаем активный купон
    await this.prisma.user.update({
      where: { id: dto.user_id },
      data: {
        active_discount: coupon.discount,
        active_coupon_id: coupon.id,
      },
    });

    return {
      message: 'Coupon applied successfully',
      code: coupon.code,
      discount: coupon.discount,
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
