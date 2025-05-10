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
} from '@nestjs/common';
import { ProductService } from './product.service';
import { FileInterceptor } from '@nestjs/platform-express';
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
import { CreateProductDto } from './dto/create-product.dto';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from 'src/shared/guards/admin.guards';
import { UpdateProductDto } from './dto/update-product.dto';
import { SmileService } from 'src/shared/services/smile.service';
import { SmileValidateDto } from './dto/smile-validate.dto';

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
        : 'https://don-vip-backend-production.up.railway.app';
  }
  @Post('')
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
    data.image = `${this.baseUrl}/uploads/products/${file.filename}`;

    return this.productService.create(data);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Get all products with pagination and optional search',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, example: 'Smile' })
  async findAll(
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 10,
    @Query('search') search = '',
  ) {
    return this.productService.findAll(page, limit, search);
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

  @Post('/smile/buy')
  @ApiBody({
    description: 'Smile',
  })
  async smileBuy(@Body() data: { sku: string; apiGame: string }) {
    return this.smileService.sendOrder(data.apiGame, data.sku);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
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
