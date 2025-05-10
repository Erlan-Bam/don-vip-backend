import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { CheckCouponDto } from './dto/check-coupon.dto';

@Injectable()
export class CouponService {
  constructor(private prisma: PrismaService) {}
  async create(data: CreateCouponDto) {
    return await this.prisma.coupon.create({ data: data });
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

  async getCoupons() {
    return await this.prisma.coupon.findMany();
  }
  async delete(id: number) {
    const coupon = await this.prisma.coupon.delete({ where: { id: id } });

    if (!coupon) {
      throw new HttpException('Coupond not found', 404);
    }

    return coupon;
  }
}
