import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  IsDecimal,
  IsNumber,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateOrderDto {
  @ApiProperty({
    description: 'Цена заказа в виде десятичного числа',
    example: 49.99,
  })
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  price: number;

  @ApiProperty({
    description: 'Количество товара равное цене',
    example: 10,
  })
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  amount: number;

  @ApiProperty({
    description: 'Тип заказа (например, "Rainbow Stone", "W-Gold", "Золото")',
    example: 'diamonds',
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

  @ApiPropertyOptional({
    description: 'ID аккаунта, связанного с заказом',
    example: 'acc_456',
    required: false,
  })
  @IsOptional()
  @IsString()
  account_id: string;

  @ApiPropertyOptional({
    description: 'ID сервера, если есть',
    example: 'srv_789',
    required: false,
  })
  @IsOptional()
  @IsString()
  server_id: string;
}
