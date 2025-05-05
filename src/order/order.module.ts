import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { SharedModule } from 'src/shared/shared.module';
import { BigoService } from './bigo.service';

@Module({
  imports: [SharedModule],
  providers: [OrderService, BigoService],
  controllers: [OrderController],
  exports: [OrderService],
})
export class OrderModule {}
