import { IsNumber, IsNotEmpty, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DonatBankBalanceDto {
  @ApiProperty({
    description: 'Amount to add to balance in USD',
    example: 100,
    minimum: 100,
    maximum: 10000,
  })
  @IsNumber({}, { message: 'Amount must be a number' })
  @IsNotEmpty({ message: 'Amount is required' })
  @Min(100, { message: 'Minimum amount is 100 USD' })
  @Max(10000, { message: 'Maximum amount is 10000 USD' })
  amount: number;
}
