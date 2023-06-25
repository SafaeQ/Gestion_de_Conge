import {
  IsDefined,
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { User } from 'entities/user';
import { META_TYPE } from '../helpers/enums';

// entity data transfer object with validation using class-validator
export class DepartementDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  chef: User;

  @IsOptional()
  @IsDefined()
  @IsNotEmpty()
  @IsEnum(META_TYPE)
  depart_type: META_TYPE;
}
