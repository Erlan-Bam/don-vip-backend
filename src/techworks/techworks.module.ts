import { Module } from '@nestjs/common';
import { TechworksService } from './techworks.service';
import { TechworksController } from './techworks.controller';

@Module({
  controllers: [TechworksController],
  providers: [TechworksService],
})
export class TechworksModule {}
