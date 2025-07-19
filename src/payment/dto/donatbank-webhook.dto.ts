import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DonatBankWebhookDto {
  @ApiProperty({
    description: 'Order ID from DonatBank',
    example: '523e4567-e89b-12d3-a456-426614174004',
  })
  @IsString({ message: 'Order ID must be a string' })
  @IsNotEmpty({ message: 'Order ID is required' })
  order_id: string;

  @ApiProperty({
    description: 'Payment status',
    example: 'SUCCESS',
  })
  @IsString({ message: 'Status must be a string' })
  @IsNotEmpty({ message: 'Status is required' })
  status: string;

  @ApiProperty({
    description: 'Transaction ID',
    example: 'txn_123456789',
  })
  @IsOptional()
  @IsString({ message: 'Transaction ID must be a string' })
  transaction_id?: string;

  @ApiProperty({
    description: 'Additional data from DonatBank',
    example: { amount: 100, currency: 'USD' },
  })
  @IsOptional()
  data?: any;
}
