import {
  IsDefined,
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { User } from 'entities/user';
import { REQUEST_HOLIDAY_STATUS } from 'helpers/enums';

// entity data transfer object with validation using class-validator
export class HolidayDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  from: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  to: string;

  @IsString()
  notes: string;

  @IsString()
  createdBy: string;

  @IsOptional()
  @IsString()
  status: REQUEST_HOLIDAY_STATUS;

  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  user: User;
}
