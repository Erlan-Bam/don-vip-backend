import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PagsmileNotificationDto {
  @ApiProperty()
  @IsString()
  trade_no: string;

  @ApiProperty()
  @IsString()
  out_trade_no: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  out_request_no: string;

  @ApiProperty()
  @IsString()
  app_id: string;

  @ApiProperty()
  @IsString()
  trade_status: string;

  @ApiProperty()
  @IsString()
  amount: string;

  @ApiProperty()
  @IsString()
  method: string;

  @ApiProperty()
  @IsString()
  currency: string;

  @ApiProperty()
  @IsString()
  timestamp: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  channel: string;

  @IsOptional()
  user: any;
}
