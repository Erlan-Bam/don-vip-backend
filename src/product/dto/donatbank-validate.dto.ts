import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DonatBankValidateDto {
  @ApiProperty({ example: '481331957' })
  @IsString()
  account_id: string;
}
