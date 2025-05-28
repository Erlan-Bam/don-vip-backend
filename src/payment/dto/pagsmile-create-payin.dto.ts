import { IsDecimal, IsInt, IsOptional, IsUUID } from 'class-validator';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class PagsmileCreatePayinDto {
  @ApiProperty({ example: '100.00', description: 'Payment amount in RUB' })
  @IsDecimal()
  amount: string;

  @ApiProperty({
    example: 20002,
    description: 'UUID of the order in the database',
  })
  @Type(() => Number)
  @IsInt()
  order_id: number;

  @ApiProperty({
    example: '1',
    description: 'ID пользователя который будет оплачивать',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  user_id?: number;
}
