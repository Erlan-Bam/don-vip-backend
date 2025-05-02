import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsDecimal } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateOrderDto {
  @ApiProperty({
    description: 'Цена заказа в виде десятичного числа',
    example: 49.99,
  })
  @Transform(({ value }) => parseFloat(value))
  @IsDecimal()
  price: number;

  @ApiProperty({
    description: 'Тип заказа (например, "Rainbow Stone", "W-Gold", "Золото")',
    example: 'subscription',
  })
  @IsString()
  type: string;

  @ApiProperty({
    description: 'Метод оплаты (например, "Tinkoff", "Smile")',
    example: 'card',
  })
  @IsString()
  payment: string;

  @IsOptional()
  user_id: number;

  @ApiProperty({
    description: 'ID аккаунта, связанного с заказом',
    example: 'acc_456',
    required: false,
  })
  @IsOptional()
  @IsString()
  account_id: string;

  @ApiProperty({
    description: 'ID сервера, если есть',
    example: 'srv_789',
    required: false,
  })
  @IsOptional()
  @IsString()
  server_id: string;
}
