import { IsDefined, IsString, IsNotEmpty } from 'class-validator';

// entity data transfer object with validation using class-validator
export class DaysOffDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  date: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  name: string;
}
