import {
  Body,
  Controller,
  HttpException,
  Patch,
  UploadedFile,
  UseInterceptors,
  Request,
  Post,
  UseGuards,
  Get,
  Query,
  ParseIntPipe,
  Param,
  Delete,
  UploadedFiles,
} from '@nestjs/common';
import { ProductService } from './product.service';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CreateProductDto, ReplenishmentItem } from './dto/create-product.dto';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from 'src/shared/guards/admin.guards';
import { UpdateProductDto } from './dto/update-product.dto';
import { SmileService } from 'src/shared/services/smile.service';
import { SmileValidateDto } from './dto/smile-validate.dto';
import { plainToInstance } from 'class-transformer';

@ApiTags('Product')
@Controller('product')
@ApiBearerAuth('JWT')
export class ProductController {
  baseUrl: string;
  constructor(
    private productService: ProductService,
    private smileService: SmileService,
    private configService: ConfigService,
  ) {
    const nodeEnv = this.configService.get<string>('NODE_ENV');
    this.baseUrl =
      nodeEnv === 'development'
        ? 'http://localhost:6001'
        : 'https://don-vip.online';
  }

  @Post('')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image', maxCount: 1 },
        { name: 'currency_image', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: './uploads/products',
          filename: (req, file, callback) => {
            const uniqueSuffix =
              Date.now() + '-' + Math.round(Math.random() * 1e9);
            const ext = extname(file.originalname);
            callback(null, `product-${uniqueSuffix}${ext}`);
          },
        }),
        limits: { fileSize: 10 * 1024 * 1024 },
        fileFilter: (req, file, callback) => {
          if (
            ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'].includes(
              file.mimetype,
            )
          ) {
            callback(null, true);
          } else {
            callback(new HttpException('Invalid file type', 400), false);
          }
        },
      },
    ),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateProductDto })
  async createProduct(
    @UploadedFiles()
    files: {
      image?: Express.Multer.File[];
      currency_image?: Express.Multer.File[];
    },
    @Body() body: any,
  ) {
    if (!files.image?.[0]) {
      throw new HttpException('Image is required', 400);
    }

    if (!files.currency_image?.[0]) {
      throw new HttpException('Currency image is required', 400);
    }

    const replenishment = body.replenishment
      ? plainToInstance(ReplenishmentItem, JSON.parse(body.replenishment))
      : [];

    const data: CreateProductDto = {
      ...body,
      image: `${this.baseUrl}/uploads/products/${files.image[0].filename}`,
      currency_image: `${this.baseUrl}/uploads/products/${files.currency_image[0].filename}`,
      replenishment,
    };

    return this.productService.create(data);
  }

  @ApiOperation({ summary: 'Create product' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Product data',
    type: CreateProductDto,
  })
  async updateProfile(
    @Body() data: CreateProductDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new HttpException(
        'Image is required and must be a valid format',
        400,
      );
    }

    data.image = `${this.baseUrl}/uploads/products/${file.filename}`;

    return this.productService.create(data);
  }

  @Patch(':id/image')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/products',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `product-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (
          ['image/png', 'image/jpeg', 'image/webp', 'image/svg'].includes(
            file.mimetype,
          )
        ) {
          callback(null, true);
        } else {
          callback(
            new HttpException(
              'Only .png, .jpeg, .svg and .webp formats are allowed!',
              400,
            ),
            false,
          );
        }
      },
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )
  @ApiOperation({ summary: 'Upload or update product image' })
  @ApiParam({ name: 'id', type: Number })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new HttpException('Image file is required', 400);
    }

    const imagePath = `${this.baseUrl}/uploads/products/${file.filename}`;

    return this.productService.update(id, { image: imagePath });
  }

  @Get('/all')
  @ApiOperation({
    summary: 'Get all products with pagination and optional search',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, example: 'Smile' })
  async findAll(
    @Query('page') page: any,
    @Query('limit') limit: any,
    @Query('search') search = '',
  ) {
    const parsedPage = parseInt(page) || 1;
    const parsedLimit = parseInt(limit) || 10;

    return this.productService.findAll(parsedPage, parsedLimit, search);
  }

  @Get('smile')
  @ApiOperation({ summary: 'Get all products from smile' })
  @UseGuards(AuthGuard('jwt'))
  async getSmileProducts() {
    return this.smileService.getProducts();
  }

  @Get('smile/:apiGame')
  @ApiOperation({ summary: 'Get sku list from smile product via api game' })
  @ApiParam({ name: 'apiGame', type: String })
  @UseGuards(AuthGuard('jwt'))
  async getSmileSKU(@Param('apiGame') apiGame: string) {
    return this.smileService.skuList(apiGame);
  }

  @Post('validate')
  @ApiOperation({ summary: 'Validate Smile donation to user account' })
  @ApiBody({
    description: 'Smile validate method body',
    type: SmileValidateDto,
  })
  async smileValidate(@Body() data: SmileValidateDto) {
    const { apiGame, user_id, server_id } = data;
    return this.smileService.validate(apiGame, user_id, server_id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({ name: 'id', type: Number })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/products',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `product-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (
          ['image/png', 'image/jpeg', 'image/webp', 'image/svg'].includes(
            file.mimetype,
          )
        ) {
          callback(null, true);
        } else {
          callback(
            new HttpException(
              'Only .png, .jpeg, .svg and .webp formats are allowed!',
              400,
            ),
            false,
          );
        }
      },
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )
  @ApiOperation({ summary: 'Update product by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateProductDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateProductDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) data.image = `${this.baseUrl}/uploads/products/${file.filename}`;

    return this.productService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @ApiOperation({ summary: 'Delete product by ID' })
  @ApiParam({ name: 'id', type: Number })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.productService.remove(id);
  }
}
