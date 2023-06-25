import { IsDefined, IsString, IsNotEmpty, IsNumber } from 'class-validator';
import { User } from 'entities/user';

// entity data transfer object with validation using class-validator
export class ComplaintDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  subject: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  message: string;

  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  user: User;
}
