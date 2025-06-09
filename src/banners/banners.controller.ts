import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

import { BannersService } from './banners.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

const generateFilename = (prefix: string, originalName: string): string => {
  const ext = extname(originalName);
  const name = originalName.split('.')[0].replace(/\s+/g, '-');
  return `${prefix}-${Date.now()}-${name}${ext}`;
};

@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Post()
  create(@Body() createBannerDto: CreateBannerDto) {
    return this.bannersService.create(createBannerDto);
  }

  @Get()
  findAll() {
    return this.bannersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bannersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBannerDto: UpdateBannerDto) {
    return this.bannersService.update(+id, updateBannerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bannersService.remove(+id);
  }

  @Patch(':id/image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/banners',
        filename: (req, file, cb) => {
          cb(null, generateFilename('pc', file.originalname));
        },
      }),
    }),
  )
  uploadPcImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const imageUrl = `/uploads/banners/${file.filename}`;
    return this.bannersService.update(+id, { image: imageUrl });
  }

  @Patch(':id/mobile-image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/banners',
        filename: (req, file, cb) => {
          cb(null, generateFilename('mobile', file.originalname));
        },
      }),
    }),
  )
  uploadMobileImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const mobileImageUrl = `/uploads/banners/${file.filename}`;
    return this.bannersService.update(+id, { mobileImage: mobileImageUrl });
  }
}
