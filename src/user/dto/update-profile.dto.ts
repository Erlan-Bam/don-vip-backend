import {
  IsOptional,
  IsString,
  IsDateString,
  IsPhoneNumber,
  IsEmail,
  IsInt,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @IsInt()
  id: number;

  @ApiPropertyOptional({
    description: 'First name of the user',
    example: 'Винсент',
  })
  @IsOptional()
  @IsString()
  first_name: string;

  @ApiPropertyOptional({
    description: 'Last name of the user',
    example: 'Вега',
  })
  @IsOptional()
  @IsString()
  last_name: string;

  @ApiPropertyOptional({
    description: 'Gender of the user',
    example: 'Мужской',
  })
  @IsOptional()
  @IsString()
  gender: string;

  @ApiPropertyOptional({
    description: 'Date of birth (ISO 8601 format)',
    example: '1992-11-02',
  })
  @IsOptional()
  @IsDateString()
  birth_date: string;

  @ApiPropertyOptional({
    description: 'Phone number in international format',
    example: '+7 903 000 00 00',
  })
  @IsOptional()
  @IsPhoneNumber(null)
  phone: string;

  @ApiPropertyOptional({
    description: 'User email (used as identifier)',
    example: 'mail@gmail.com',
  })
  @IsOptional()
  @IsEmail()
  identifier: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Avatar image file (PNG, JPG, WEBP)',
  })
  @IsOptional()
  avatar: string;
}
