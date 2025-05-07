import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateFeedbackDto {
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  reaction: boolean;

  @ApiPropertyOptional({ example: 'Great product!' })
  @IsString()
  text: string;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  product_id: number;
}
