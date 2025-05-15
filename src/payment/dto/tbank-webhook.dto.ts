import { IsInt, IsOptional, IsString, IsDate, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class TBankWebhookDto {
  @IsString()
  userId: string;

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
  customerKey?: string;

  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  paymentId?: string;

  @IsOptional()
  @IsString()
  rebillId?: string;

  @IsOptional()
  @IsString()
  terminalKey?: string;

  @IsOptional()
  @IsObject()
  raw?: object;
}
