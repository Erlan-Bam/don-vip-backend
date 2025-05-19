import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BigoValidateDto {
  @ApiProperty({ example: '481331957' })
  @IsString()
  user_id: string;
}
