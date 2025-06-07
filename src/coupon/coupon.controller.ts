import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { CouponService } from './coupon.service';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from 'src/shared/guards/admin.guards';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { CheckCouponDto } from './dto/check-coupon.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ApplyCouponDto } from './dto/apply-coupon.dto';

@ApiTags('Coupon')
@Controller('coupon')
export class CouponController {
  constructor(private couponService: CouponService) {}

  @Post()
  @ApiBearerAuth('JWT')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @ApiOperation({ summary: 'Create a new coupon' })
  @ApiBody({ type: CreateCouponDto })
  @ApiResponse({ status: 201, description: 'Coupon created successfully' })
  async create(@Body() data: CreateCouponDto) {
    return await this.couponService.create(data);
  }

  @Post('apply')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Apply a coupon to user by user_id' })
  @ApiBody({ type: ApplyCouponDto })
  @ApiResponse({ status: 200, description: 'Coupon applied' })
  async applyCoupon(@Body() dto: ApplyCouponDto) {
    return await this.couponService.applyCoupon(dto);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @ApiOperation({ summary: 'Update a coupon' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateCouponDto })
  @ApiResponse({ status: 200, description: 'Coupon updated successfully' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateCouponDto,
  ) {
    data.id = id;
    return await this.couponService.update(data);
  }

  @Get('check')
  @ApiOperation({ summary: 'Check a coupon code' })
  @ApiResponse({ status: 200, description: 'Coupon validity result' })
  async checkCoupon(@Query() data: CheckCouponDto) {
    return await this.couponService.check(data);
  }

  @Get('all')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @ApiOperation({ summary: 'Get all coupons' })
  @ApiResponse({ status: 200, description: 'List of all coupons' })
  async getCoupons() {
    return await this.couponService.getCoupons();
  }

  @Delete(':id')
  @ApiBearerAuth('JWT')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @ApiOperation({ summary: 'Delete a coupon by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Coupon deleted successfully' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return await this.couponService.delete(id);
  }
}
