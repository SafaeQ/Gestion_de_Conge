import { IsDefined, IsString, IsNotEmpty, IsNumber } from 'class-validator';
import { Departement } from 'entities/departements';
// entity data transfer object with validation using class-validator
export class TeamDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  departement: Departement;
}
