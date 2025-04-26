import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { CouponService } from './coupon.service';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from 'src/shared/guards/admin.guards';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { CheckCouponDto } from './dto/check-coupon.dto';

@Controller('coupon')
export class CouponController {
  constructor(private couponService: CouponService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  async create(@Body() data: CreateCouponDto) {
    return await this.couponService.create(data);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  async update(@Body() data: UpdateCouponDto) {
    return await this.couponService.update(data);
  }

  @Get('check')
  @UseGuards(AuthGuard('jwt'))
  async checkCoupon(data: CheckCouponDto) {
    return await this.couponService.check(data);
  }

  @Get('all')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  async getCoupons() {
    return await this.couponService.getCoupons();
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  async delete(@Param('id') id: number) {
    return await this.couponService.delete(id);
  }
}
