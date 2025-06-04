import { Module } from '@nestjs/common';
import { TechworksService } from './techworks.service';
import { TechworksController } from './techworks.controller';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [TechworksController],
  providers: [TechworksService],
})
export class TechworksModule {}
