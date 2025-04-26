import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckCouponDto {
  @ApiProperty({
    description: 'Coupon code to validate',
    example: 'SUMMER20',
  })
  @IsString()
  code: string;
}
