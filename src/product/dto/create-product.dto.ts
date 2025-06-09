import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductType } from '@prisma/client';

export class ReplenishmentItem {
  @ApiProperty({
    example: 9.99,
    description: 'Цена за единицу товара (например, за 100 алмазов)',
  })
  @IsNumber()
  price: number;

  @ApiProperty({
    example: 100,
    description: 'Количество единиц, предоставляемых за указанную цену',
  })
  @IsNumber()
  amount: number;

  @ApiProperty({
    example: 'diamonds',
    description: 'Тип товара, например: алмазы, монеты, коробки и т.д.',
  })
  @IsString()
  type: string;

  @ApiProperty({
    example: 'sku_number_1',
    description:
      'Если этот пакет связан с Smile, указывается SKU из GET /api/product/smile/:apiGame',
  })
  @IsString()
  sku: string;
}

export class CreateProductDto {
  @ApiProperty({
    example: 'Bigo LIVE',
    description: 'Название продукта',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'in Bigo LIVE you can buy diamonds',
    description: 'Краткое описание продукта и его назначения',
  })
  @IsString()
  description: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: true,
    description: 'Изображение продукта (multipart/form-data)',
  })
  @IsOptional()
  image: any;

  @ApiProperty({
    type: [ReplenishmentItem],
    description:
      'Варианты пополнения (наборы с ценой, количеством, типом и SKU)',
    example: [
      { price: 9.99, amount: 100, type: 'diamonds', sku: '1' },
      { price: 5.49, amount: 50, type: 'diamonds', sku: 'Mobile_Legends_PASS' },
    ],
  })
  @IsOptional()
  @Type(() => ReplenishmentItem)
  replenishment: ReplenishmentItem[];

  @ApiPropertyOptional({
    example: 'mobilelegendsru',
    description: 'Идентификатор игры в Smile API (если используется)',
  })
  @IsOptional()
  @IsString()
  smile_api_game?: string;

  @ApiProperty({
    example: 'Bigo',
    enum: ProductType,
    description: 'Тип продукта (enum ProductType)',
  })
  @IsEnum(ProductType)
  type: ProductType;

  @ApiProperty({
    example: 'https://cdn.example.com/icons/usd.png',
    description: 'URL изображения валюты (иконка)',
  })
  @IsString()
  currency_image: any;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: true,
    description: 'Изображение валюты (multipart/form-data)',
  })
  @IsOptional()
  currency_name: string;
}
