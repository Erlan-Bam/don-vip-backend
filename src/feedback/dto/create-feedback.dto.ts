import { IsBoolean, IsInt, IsString } from 'class-validator';
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

  @ApiProperty({ example: 1 })
  @IsInt()
  user_id: number;
}
