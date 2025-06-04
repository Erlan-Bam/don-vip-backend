import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateBankDto {
  @ApiProperty({
    description: 'Название банка',
    example: 'Central Bank',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Флаг активности банка',
    required: false,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
