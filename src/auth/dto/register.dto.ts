import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  IsInt,
  IsEnum,
} from 'class-validator';

export function IsEmailOrPhone(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isEmailOrPhone',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, _args: ValidationArguments) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          const phoneRegex = /^\+?[1-9]\d{1,14}$/;
          return (
            typeof value === 'string' &&
            (emailRegex.test(value) || phoneRegex.test(value))
          );
        },
        defaultMessage(_args: ValidationArguments) {
          return 'identifier must be a valid email or phone number';
        },
      },
    });
  };
}

export class RegisterDto {
  @ApiProperty({
    description: 'Unique user ID',
    example: 1,
  })
  @IsInt()
  @Type(() => Number)
  id: number;

  @ApiProperty({
    description: 'Email address or phone number in E.164 format',
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

  @ApiProperty({
    description: 'Preferred language (ru or en)',
    example: 'ru',
    enum: ['ru', 'en'],
  })
  @IsEnum(['ru', 'en'])
  lang: 'ru' | 'en';
}
