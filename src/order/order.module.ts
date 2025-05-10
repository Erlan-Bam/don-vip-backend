import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { SharedModule } from 'src/shared/shared.module';
import { SmileService } from 'src/shared/services/smile.service';

@Module({
  imports: [SharedModule],
  providers: [OrderService, SmileService],
  controllers: [OrderController],
  exports: [OrderService],
})
export class OrderModule {}
