import { IsDefined, IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class shiftDto {
  @IsDefined()
  @IsNotEmpty()
  value: string;

  @IsOptional()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  bgColor: string;

  @IsOptional()
  @IsDefined()
  @IsBoolean()
  holiday: boolean;

  @IsOptional()
  @IsDefined()
  todelete: boolean;
}
