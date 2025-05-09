import {
  IsArray,
  IsNotEmpty,
  IsString,
  ValidateNested,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ReplenishmentItem {
  @ApiProperty({ example: 9.99 })
  @IsNumber()
  price: number;

  @ApiProperty({ example: 100 })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'box' })
  @IsString()
  type: string;
}

export class CreateProductDto {
  @ApiProperty({ example: 'Bigo LIVE' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'in Bigo LIVE you can buy diamonds' })
  @IsString()
  description: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: true,
  })
  @IsOptional()
  image: any;

  @ApiProperty({
    type: [ReplenishmentItem],
    example: [
      { price: 9.99, amount: 100, type: 'diamonds' },
      { price: 5.49, amount: 50, type: 'diamonds' },
    ],
  })
  @IsOptional()
  @Type(() => ReplenishmentItem)
  replenishment: ReplenishmentItem[];

  @ApiPropertyOptional({ example: 'mobilelegendsru' })
  @IsOptional()
  @IsString()
  smile_api_game?: string;
}
