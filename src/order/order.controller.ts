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

@ApiTags('Orders')
@Controller('order')
@ApiBearerAuth('JWT')
@UseGuards(AuthGuard('jwt'))
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiOperation({ summary: 'Create order' })
  async create(@Body() data: CreateOrderDto, @Request() request) {
    data.user_id = request.user.id;
    return this.orderService.create(data);
  }

  @Get('history')
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
  async findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete order' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  async remove(@Param('id') id: string) {
    return this.orderService.remove(id);
  }
}
