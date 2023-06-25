import { IsDefined, IsNotEmpty, IsNumber } from 'class-validator';
import { User } from 'entities/user';
import { Shift } from '../entities/shifts';

export class recordDto {
  @IsDefined()
  @IsNotEmpty()
  user: User;

  @IsDefined()
  @IsNotEmpty()
  shift: Shift;

  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  boxDay: number;

  @IsDefined()
  @IsNotEmpty()
  day: Date;
}
