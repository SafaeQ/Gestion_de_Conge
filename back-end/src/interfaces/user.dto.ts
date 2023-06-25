import {
  IsDefined,
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsEnum,
  IsArray,
} from 'class-validator';
import { Departement } from 'entities/departements';
import { MEntity } from 'entities/entities';
import { Team } from 'entities/teams';
import { ROLES, META_TYPE } from '../helpers/enums';

export class UserRestrictionDto {
  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  user: number;

  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  departement: number;
}

// entity data transfer object with validation using class-validator
export class UserDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsDefined()
  @IsNotEmpty()
  @IsArray()
  departements: Departement[];

  @IsOptional()
  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  entity: MEntity;

  @IsOptional()
  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  team: Team;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  password: string;

  @IsOptional()
  solde: number;

  @IsOptional()
  @IsDefined()
  @IsNotEmpty()
  @IsEnum(ROLES)
  role: ROLES;

  @IsOptional()
  @IsDefined()
  @IsNotEmpty()
  @IsEnum(META_TYPE)
  type: META_TYPE;

  @IsOptional()
  @IsDefined()
  @IsArray()
  access_entity: number[];
 
  @IsOptional()
  @IsDefined()
  @IsArray()
  access_entity_hr: number[];

  @IsOptional()
  @IsDefined()
  @IsArray()
  access_team: number[];

  @IsOptional()
  @IsDefined()
  @IsArray()
  access_planning_teams: number[];
}

// entity data transfer object with validation using class-validator
export class UpdateUserDto {
  @IsOptional()
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsDefined()
  @IsNotEmpty()
  @IsArray()
  departements: Departement[];

  @IsOptional()
  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  entity: MEntity;

  @IsOptional()
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsOptional()
  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  team: Team;

  @IsOptional()
  @IsDefined()
  @IsNotEmpty()
  @IsEnum(ROLES)
  role: ROLES;

  @IsOptional()
  @IsDefined()
  @IsNotEmpty()
  @IsEnum(META_TYPE)
  user_type: META_TYPE;

  @IsOptional()
  @IsString()
  password: string;
}
