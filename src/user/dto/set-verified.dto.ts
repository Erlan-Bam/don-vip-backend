import { ApiProperty } from '@nestjs/swagger';
import { IsEmailOrPhone } from 'src/auth/dto/register.dto';

export class SetVerifiedDto {
  @ApiProperty({
    description: 'Email or phone number in E.164 format',
    example: 'user@example.com or +77001112233',
  })
  @IsEmailOrPhone()
  identifier: string;
}
