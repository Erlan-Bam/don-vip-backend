import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { SharedModule } from './shared/shared.module';
import { UserModule } from './user/user.module';
import { CouponModule } from './coupon/coupon.module';
import { OrderModule } from './order/order.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [
    AuthModule,
    SharedModule,
    UserModule,
    CouponModule,
    OrderModule,
    PaymentModule,
  ],
})
export class AppModule {}
