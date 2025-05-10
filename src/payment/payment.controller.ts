import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Headers,
  UsePipes,
  ValidationPipe,
  Get,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PagsmileCreatePayinDto } from './dto/pagsmile-create-payin.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PagsmileNotificationDto } from './dto/pagsmile-notification.dto';

@ApiTags('Payment')
@Controller('payment')
@ApiBearerAuth('JWT')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post('pagsmile/payin')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Create a Payin transaction via Pagsmile' })
  @ApiResponse({ status: 201, description: 'Payin created successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  async createPagsmilePayin(
    @Body() data: PagsmileCreatePayinDto,
    @Request() request,
  ) {
    data.user_id = request.user.id;
    return this.paymentService.createPagsmilePayin(data);
  }

  @Post('pagsmile/notification')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  )
  async handleNotification(
    @Body() data: PagsmileNotificationDto,
    @Headers('pagsmile-signature') signature: string,
    @Request() req,
  ) {
    const rawBody = req.rawBody as string;
    return await this.paymentService.pagsmileNotification(
      data,
      signature,
      rawBody,
    );
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
    return this.paymentService.getHistory(request.user.id, page, limit);
  }
}
