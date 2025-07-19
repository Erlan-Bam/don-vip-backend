import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DonatBankProductInfoDto {
  @ApiProperty({
    description: 'Product ID to get information about',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString({ message: 'Product ID must be a string' })
  @IsNotEmpty({ message: 'Product ID is required' })
  id: string;
}
