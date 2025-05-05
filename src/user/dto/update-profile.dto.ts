import { IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @IsOptional()
  id: number;

  @ApiProperty({
    description: 'First name of the user',
    example: 'John',
  })
  @IsOptional()
  @IsString()
  first_name: string;

  @ApiProperty({
    description: 'Last name of the user',
    example: 'Doe',
  })
  @IsOptional()
  @IsString()
  last_name: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Avatar image file (PNG, JPG, WEBP)',
  })
  @IsOptional()
  avatar: string;
}
