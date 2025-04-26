import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateCouponDto {
  @IsOptional()
  id: number;

  @IsString()
  @IsOptional()
  code: string;

  @IsInt()
  @IsOptional()
  limit: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  discount: number;
}
