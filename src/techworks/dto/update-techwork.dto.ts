import { IsBoolean } from 'class-validator';

export class UpdateTechWorksDto {
  @IsBoolean()
  isTechWorks: boolean;
}
