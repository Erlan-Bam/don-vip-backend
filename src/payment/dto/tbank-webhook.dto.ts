import { IsInt, IsOptional, IsString, IsDate, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class TBankWebhookDto {
  @Type(() => Number)
  @IsInt()
  Amount: number;

  @IsString()
  OrderId: string;

  @IsOptional()
  @IsObject()
  DATA: any;

  @IsOptional()
  @IsString()
  CustomerKey?: string;

  @IsString()
  Status: string;

  @IsOptional()
  @IsInt()
  PaymentId?: string;

  @IsOptional()
  @IsString()
  TerminalKey?: string;
}
