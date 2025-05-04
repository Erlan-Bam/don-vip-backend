import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { SharedModule } from 'src/shared/shared.module';
import { OrderModule } from 'src/order/order.module';

@Module({
  imports: [SharedModule, OrderModule],
  providers: [PaymentService],
  controllers: [PaymentController],
})
export class PaymentModule {}
