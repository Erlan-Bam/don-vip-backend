import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCouponDto {
  @ApiProperty({
    description: 'Coupon ID to update',
    example: 1,
    required: false,
  })
  @IsOptional()
  id: number;

  @ApiProperty({
    description: 'New coupon code (optional)',
    example: 'WINTER30',
    required: false,
  })
  @IsString()
  @IsOptional()
  code: string;

  @ApiProperty({
    description: 'New usage limit (optional)',
    example: 50,
    required: false,
  })
  @IsInt()
  @IsOptional()
  limit: number;

  @ApiProperty({
    description: 'New discount percentage (0-100)',
    example: 30,
    minimum: 0,
    maximum: 100,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  discount: number;
}
