import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Headers,
  RawBody,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PagsmileCreatePayinDto } from './dto/pagsmile-create-payin.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
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
  async handleNotification(
    @Body() data: PagsmileNotificationDto,
    @Headers('pagsmile-signature') signature: string,
    @RawBody() rawBody: Buffer,
    @Request() req,
  ) {
    console.log(data);
    return await this.paymentService.pagsmileNotification(
      data,
      signature,
      rawBody,
    );
  }
}
