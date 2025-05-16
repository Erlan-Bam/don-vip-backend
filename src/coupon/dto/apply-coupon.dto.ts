import { Type } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class ApplyCouponDto {
  @IsString()
  code: string;

  @IsNumber()
  @Type(() => Number)
  user_id: number;
}
