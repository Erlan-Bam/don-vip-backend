import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { IsEmailOrPhone } from './register.dto';

enum Language {
  ru = 'ru',
  en = 'en',
}

export class ResendCodeDto {
  @ApiProperty({
    description: 'Email or phone number in E.164 format',
    example: 'user@example.com or +77001112233',
  })
  @IsEmailOrPhone()
  identifier: string;

  @ApiProperty({ enum: Language, example: 'ru' })
  @IsEnum(Language)
  lang: Language;
}
