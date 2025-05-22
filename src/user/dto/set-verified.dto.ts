import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';
import { IsEmailOrPhone } from 'src/auth/dto/register.dto';

export class SetVerifiedDto {
  @ApiProperty({
    description: 'Email or phone number in E.164 format',
    example: 'user@example.com or +77001112233',
  })
  @IsEmailOrPhone()
  identifier: string;

  @ApiProperty({ example: '12345' })
  @IsString()
  @Length(5, 5) // assuming 5-digit code
  code: string;
}
