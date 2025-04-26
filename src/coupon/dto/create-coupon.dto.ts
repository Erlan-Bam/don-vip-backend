import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCouponDto {
  @ApiProperty({
    description: 'Coupon code',
    example: 'SUMMER20',
  })
  @IsString()
  code: string;

  @ApiProperty({
    description: 'Maximum number of times the coupon can be used (optional)',
    example: 100,
    required: false,
  })
  @IsInt()
  @IsOptional()
  limit: number;

  @ApiProperty({
    description: 'Discount percentage (0-100)',
    example: 20,
    minimum: 0,
    maximum: 100,
  })
  @IsInt()
  @Min(0)
  @Max(100)
  discount: number;
}
