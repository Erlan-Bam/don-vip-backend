import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { TechworksService } from './techworks.service';
import { CreateTechworkDto } from './dto/create-techwork.dto';
import { UpdateTechWorksDto } from './dto/update-techwork.dto';

@Controller('techworks')
export class TechworksController {
  constructor(private readonly techworksService: TechworksService) {}

  @Get(':id')
  async getWebsite(@Param('id', ParseIntPipe) id: number) {
    return this.techworksService.getById(id);
  }

  @Patch(':id/tech-works')
  async updateTechWorks(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTechWorksDto,
  ) {
    return this.techworksService.updateTechWorks(id, dto);
  }

  // (Опционально) эндпоинт, который просто переключает текущее значение
  @Patch(':id/tech-works/toggle')
  async toggleTechWorks(@Param('id', ParseIntPipe) id: number) {
    return this.techworksService.toggleTechWorks(id);
  }
}
