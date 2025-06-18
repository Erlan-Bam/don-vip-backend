import { IsString, IsUrl, IsOptional } from 'class-validator';

export class CreateBannerDto {
  @IsOptional()
  @IsString()
  @IsUrl({}, { message: 'Image must be a valid URL' })
  image?: string;

  @IsOptional()
  @IsString()
  @IsUrl({}, { message: 'Mobile image must be a valid URL' })
  mobileImage?: string;

  @IsString()
  @IsUrl({}, { message: 'Button link must be a valid URL' })
  buttonLink: string;
}
