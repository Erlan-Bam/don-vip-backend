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
  UploadedFiles,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

import { BannersService } from './banners.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { ConfigService } from '@nestjs/config';

const generateFilename = (prefix: string, originalName: string): string => {
  const ext = extname(originalName);
  const name = originalName.split('.')[0].replace(/\s+/g, '-');
  return `${prefix}-${Date.now()}-${name}${ext}`;
};

@Controller('banners')
export class BannersController {
  baseUrl: string;
  constructor(
    private readonly bannersService: BannersService,
    private configService: ConfigService,
  ) {
    const nodeEnv = this.configService.get<string>('NODE_ENV');
    this.baseUrl =
      nodeEnv === 'development'
        ? 'http://localhost:6001'
        : 'https://don-vip.com';
  }

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'pcImage', maxCount: 1 },
        { name: 'mobileImage', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: './uploads/banners',
          filename: (req, file, cb) => {
            const prefix = file.fieldname === 'pcImage' ? 'pc' : 'mobile';
            const ext = extname(file.originalname);
            const name = file.originalname
              .split('.')
              .slice(0, -1)
              .join('.')
              .replace(/\s+/g, '-');
            cb(null, `${prefix}-${Date.now()}-${name}${ext}`);
          },
        }),
      },
    ),
  )
  async create(
    @Body(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
      }),
    )
    createBannerDto: CreateBannerDto,
    @UploadedFiles()
    files: {
      pcImage?: Express.Multer.File[];
      mobileImage?: Express.Multer.File[];
    },
  ) {
    const pc = files.pcImage?.[0];
    const mob = files.mobileImage?.[0];

    // Override with uploaded file URLs if files are provided
    if (pc) {
      createBannerDto.image = `${this.baseUrl}/uploads/banners/${pc.filename}`;
    }

    if (mob) {
      createBannerDto.mobileImage = `${this.baseUrl}/uploads/banners/${mob.filename}`;
    }

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
    const imageUrl = `${this.baseUrl}/uploads/banners/${file.filename}`;
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
    const mobileImageUrl = `${this.baseUrl}/uploads/banners/${file.filename}`;
    return this.bannersService.update(+id, { mobileImage: mobileImageUrl });
  }
}
