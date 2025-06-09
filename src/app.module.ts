import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { SharedModule } from './shared/shared.module';
import { UserModule } from './user/user.module';
import { CouponModule } from './coupon/coupon.module';
import { OrderModule } from './order/order.module';
import { PaymentModule } from './payment/payment.module';
import { ProductModule } from './product/product.module';
import { FeedbackModule } from './feedback/feedback.module';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { LoggerMiddleware } from './shared/logger';
import { TechworksModule } from './techworks/techworks.module';
import { BankModule } from './bank/bank.module';
import { ScheduleModule } from '@nestjs/schedule';
import { BannersModule } from './banners/banners.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads', // exposes /uploads path
    }),
    AuthModule,
    SharedModule,
    UserModule,
    CouponModule,
    OrderModule,
    PaymentModule,
    ProductModule,
    FeedbackModule,
    TechworksModule,
    BankModule,
    BannersModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*'); // or specific routes
  }
}
