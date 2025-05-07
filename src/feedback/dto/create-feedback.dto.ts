import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFeedbackDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  reaction: boolean;

  @ApiProperty({ example: 'Great product!' })
  @IsString()
  text: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  product_id: number;

  @IsOptional()
  user_id: number;
}
