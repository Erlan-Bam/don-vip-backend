import { IsOptional, IsString } from 'class-validator';

export class PagsmileNotificationDto {
  @IsString()
  trade_no: string;

  @IsString()
  out_trade_no: string;

  @IsOptional()
  @IsString()
  out_request_no: string;

  @IsString()
  app_id: string;

  @IsString()
  trade_status: string;

  @IsString()
  amount: string;

  @IsString()
  method: string;

  @IsString()
  currency: string;

  @IsString()
  timestamp: string;

  @IsOptional()
  @IsString()
  channel: string;

  @IsOptional()
  user: any;
}
