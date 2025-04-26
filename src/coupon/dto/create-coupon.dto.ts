import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateCouponDto {
  @IsString()
  code: string;

  @IsInt()
  @IsOptional()
  limit: number;

  @IsInt()
  @Min(0)
  @Max(100)
  discount: number;
}
