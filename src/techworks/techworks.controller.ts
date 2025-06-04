import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { TechworksService } from './techworks.service';
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

  @Patch(':id/tech-works/toggle')
  async toggleTechWorks(@Param('id', ParseIntPipe) id: number) {
    return this.techworksService.toggleTechWorks(id);
  }
}
