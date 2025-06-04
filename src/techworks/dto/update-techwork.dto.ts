import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateTechWorksDto {
  @IsBoolean()
  isTechWorks: boolean;

  @IsOptional()
  @IsString()
  techWorksEndsAt?: string;
}
