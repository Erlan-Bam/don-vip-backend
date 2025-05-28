import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { IsEmailOrPhone } from 'src/auth/dto/register.dto';

export class CreateOrderDto {
  @ApiProperty({
    description: 'Email or phone number in E.164 format',
    example: 'user@example.com or +77001112233',
  })
  @IsEmailOrPhone()
  identifier: string;

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
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  user_id?: number | null;

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
