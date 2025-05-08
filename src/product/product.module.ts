import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { SharedModule } from 'src/shared/shared.module';
import { SmileService } from 'src/shared/services/smile.service';

@Module({
  imports: [SharedModule],
  controllers: [ProductController],
  providers: [ProductService, SmileService],
})
export class ProductModule {}
