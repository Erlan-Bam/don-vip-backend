// dto/smile-validate.dto.ts
import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SmileValidateDto {
  @ApiProperty({ example: 'mobilelegendsru' })
  @IsString()
  apiGame: string;

  @ApiProperty({ example: '481331957' })
  @IsString()
  user_id: string;

  @ApiProperty({ example: '6031' })
  @IsString()
  server_id: string;
}
