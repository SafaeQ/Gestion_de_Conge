import {
  IsDefined,
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { Departement } from 'entities/departements';
import { MEntity } from 'entities/entities';
import { Team } from 'entities/teams';
import { User } from 'entities/user';

// entity data transfer object with validation using class-validator
export class TicketDto {
  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  user: User;

  @IsOptional()
  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  entity: MEntity;

  @IsOptional()
  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  issuer_team: Team;

  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  departement: Departement;

  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  target_team: Team;

  @IsOptional()
  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  assigned_to: User;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  related_ressource: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  body: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  subject: string;
}

// entity data transfer object with validation using class-validator
export class UpdateTicketDto {
  @IsOptional()
  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  user: User;

  @IsOptional()
  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  entity: MEntity;

  @IsOptional()
  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  issuer_team: Team;

  @IsOptional()
  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  target_team: Team;

  @IsOptional()
  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  assigned_to: User;

  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  departement: Departement;

  @IsOptional()
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  related_ressource: string;

  @IsOptional()
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  subject: string;

  last_update: string;
}
