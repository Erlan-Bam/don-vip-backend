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
  HttpException,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from 'src/shared/guards/admin.guards';

@ApiTags('Orders')
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

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
    @Request() req,
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 10,
    @Query('search') search?: string, // 👈 Accept search param
  ) {
    if (req.user.role !== 'Admin') {
      throw new HttpException('Forbidden', 403);
    }

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

  @Get('guest/history')
  @ApiQuery({
    name: 'accountId',
    required: true,
    type: String,
    example: '123456',
    description: 'Account ID to search for a specific order',
  })
  @ApiQuery({
    name: 'serverId',
    required: true,
    type: String,
    example: '1',
    description: 'Server ID to search for a specific order',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiOperation({
    summary: 'Get order history for guest user by account and server id',
  })
  async getGuestHistory(
    @Query('serverId') userId: string,
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 10,
  ) {
    return this.orderService.getGuestUserHistory(userId, page, limit);
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
  async getAnalytics(@Request() req) {
    if (req.user.role !== 'Admin') {
      throw new HttpException('Forbidden', 403);
    }
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
  async getMonthlySales(@Request() req) {
    if (req.user.role !== 'Admin') {
      throw new HttpException('Forbidden', 403);
    }

    return this.orderService.getMonthlySalesOverview();
  }
}
