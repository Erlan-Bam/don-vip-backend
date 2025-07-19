import { IsString, IsNotEmpty, IsNumber, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DonatBankCreateOrderDto {
  @ApiProperty({
    description: 'Product ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString({ message: 'Product ID must be a string' })
  @IsNotEmpty({ message: 'Product ID is required' })
  productId: string;

  @ApiProperty({
    description: 'Package ID',
    example: '323e4567-e89b-12d3-a456-426614174002',
  })
  @IsString({ message: 'Package ID must be a string' })
  @IsNotEmpty({ message: 'Package ID is required' })
  packageId: string;

  @ApiProperty({
    description: 'Quantity of items',
    example: 1,
  })
  @IsNumber({}, { message: 'Quantity must be a number' })
  quantity: number;

  @ApiProperty({
    description: 'Additional fields object',
    example: {
      user_id: 'user@example.com',
      zone_id: 'us',
    },
  })
  @IsObject({ message: 'Fields must be an object' })
  fields: Record<string, any>;
}
