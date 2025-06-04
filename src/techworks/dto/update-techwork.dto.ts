import { IsBoolean, IsOptional, IsNumber } from 'class-validator';

export class UpdateTechWorksDto {
  @IsBoolean()
  isTechWorks: boolean;

  @IsOptional()
  @IsNumber()
  durationMinutes?: number; // длительность в минутах, после которой auto-выкл
}
