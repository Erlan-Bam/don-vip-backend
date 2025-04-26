import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { SharedModule } from './shared/shared.module';
import { UserModule } from './user/user.module';
import { CouponModule } from './coupon/coupon.module';

@Module({
  imports: [AuthModule, SharedModule, UserModule, CouponModule],
})
export class AppModule {}
