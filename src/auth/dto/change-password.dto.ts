import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum } from 'class-validator';

enum Language {
  ru = 'ru',
  en = 'en',
}

export class ChangePasswordDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ enum: Language, example: 'ru' })
  @IsEnum(Language)
  lang: Language;
}
