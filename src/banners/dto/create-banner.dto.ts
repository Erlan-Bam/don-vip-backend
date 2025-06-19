import { IsString, IsUrl, IsOptional } from 'class-validator';

export class CreateBannerDto {
  @IsOptional()
  image: string;

  @IsOptional()
  mobileImage: string;

  @IsString()
  @IsUrl({}, { message: 'Button link must be a valid URL' })
  buttonLink: string;
}
