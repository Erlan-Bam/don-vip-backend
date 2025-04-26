import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { IsEmailOrPhone } from './register.dto';

export class LoginDto {
  @ApiProperty({
    description: 'Email or phone number in E.164 format',
    example: 'user@example.com or +77001112233',
  })
  @IsEmailOrPhone()
  identifier: string;

  @ApiProperty({
    description: 'User password',
    example: 'password123',
  })
  @IsString()
  password: string;
}
