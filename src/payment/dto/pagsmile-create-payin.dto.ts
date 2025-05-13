import { IsDecimal, IsInt, IsOptional, IsUUID } from 'class-validator';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class PagsmileCreatePayinDto {
  @ApiProperty({ example: '100.00', description: 'Payment amount in RUB' })
  @IsDecimal()
  amount: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID of the order in the database',
  })
  @IsUUID()
  order_id: string;

  @ApiProperty({
    example: '1',
    description: 'ID пользователя который будет оплачивать',
  })
  @Type(() => Number)
  @IsInt()
  user_id: number;
}
