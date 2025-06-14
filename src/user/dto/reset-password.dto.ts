import { IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ example: '12421' })
  @IsString()
  code: string;

  @ApiProperty({ example: 'MyNewSecureP@ssw0rd' })
  @IsString()
  new_password: string;

  @ApiPropertyOptional()
  @IsOptional()
  identifier: string;
}
