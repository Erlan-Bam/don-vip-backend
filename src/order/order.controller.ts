import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Delete,
  ParseIntPipe,
  UseGuards,
  Request,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiBearerAuth,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from 'src/shared/guards/admin.guards';
import { DonatBankService } from 'src/shared/services/donatbank.service';
import { DonatBankProductInfoDto } from './dto/donatbank-product-info.dto';

@ApiTags('Orders')
@Controller('order')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly donatBankService: DonatBankService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create order' })
  async create(@Body() data: CreateOrderDto) {
    return this.orderService.create(data);
  }

  @Get('/admin/history')
  @ApiBearerAuth('JWT')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @ApiOperation({ summary: 'Get all orders (admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, example: '7999' }) // 👈 Add this
  async getAllForAdmin(
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 10,
    @Query('search') search?: string,
  ) {
    return this.orderService.getAllForAdmin(page, limit, search);
  }

  @Get('history')
  @ApiBearerAuth('JWT')
  @UseGuards(AuthGuard('jwt'))
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  async getHistory(
    @Request() request,
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 10,
  ) {
    return this.orderService.getHistory(request.user.id, page, limit);
  }

  @Get()
  @ApiOperation({ summary: 'Get all orders' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  async findAll(
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 10,
  ) {
    return this.orderService.findAll(page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one order' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.findOne(id);
  }

  @Get('/admin/analytics')
  @ApiBearerAuth('JWT')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @ApiOperation({ summary: 'Get analytics for admin' })
  async getAnalytics() {
    return this.orderService.getAnalytics();
  }

  @Delete('/delete/:id')
  @ApiBearerAuth('JWT')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Delete order' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.remove(id);
  }

  @Get('/admin/monthly-sales')
  @ApiBearerAuth('JWT')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @ApiOperation({ summary: 'Ежемесячные продажи за текущий год' })
  async getMonthlySales() {
    return this.orderService.getMonthlySalesOverview();
  }

  @Get('donatbank/products')
  @ApiOperation({ summary: 'Get DonatBank product list' })
  @ApiResponse({
    status: 200,
    description: 'Product list retrieved successfully',
  })
  @ApiResponse({ status: 500, description: 'DonatBank API error' })
  async getDonatBankProducts() {
    return this.donatBankService.getProductList();
  }

  @Post('donatbank/product/info')
  @ApiOperation({ summary: 'Get detailed DonatBank product information' })
  @ApiResponse({
    status: 200,
    description: 'Product information retrieved successfully',
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 500, description: 'DonatBank API error' })
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  )
  async getDonatBankProductInfo(@Body() data: DonatBankProductInfoDto) {
    return this.donatBankService.getProductInfo(data.id);
  }
}
