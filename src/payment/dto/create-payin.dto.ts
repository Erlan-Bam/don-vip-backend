import { IsDecimal, IsOptional, IsUUID } from 'class-validator';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';

export class CreatePayinDto {
  @ApiProperty({ example: '100.00', description: 'Payment amount in RUB' })
  @IsDecimal()
  amount: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID of the order in the database',
  })
  @IsUUID()
  order_id: string;

  @ApiHideProperty()
  @IsOptional()
  user_id: number;
}
