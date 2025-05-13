import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({
    description: 'ID продукта, который покупается',
    example: 1,
  })
  @IsInt()
  product_id: number;

  @ApiProperty({
    description: 'ID позиции пополнения из массива replenishment (Пакетов)',
    example: 0,
  })
  @IsInt()
  @Min(0)
  item_id: number;

  @ApiProperty({
    description: 'Метод оплаты (например, "Tinkoff", "Smile")',
    example: 'Tinkoff',
  })
  @IsString()
  payment: string;

  @ApiProperty({
    description: 'ID пользователя, совершающего заказ',
    example: 1,
    required: true,
  })
  @IsInt()
  user_id: number;

  @ApiPropertyOptional({
    description: 'ID аккаунта, связанного с заказом',
    example: 'acc_456',
    required: false,
  })
  @IsOptional()
  @IsString()
  account_id?: string;

  @ApiPropertyOptional({
    description: 'ID сервера, если применимо (например, сервер игры)',
    example: 'srv_789',
    required: false,
  })
  @IsOptional()
  @IsString()
  server_id?: string;
}
