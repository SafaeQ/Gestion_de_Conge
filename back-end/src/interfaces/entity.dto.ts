import {
  IsDefined,
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { User } from 'entities/user';

// entity data transfer object with validation using class-validator
export class EntityDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  chef: User;
}

export interface SyncResponse {
  timestamp: Date;
  data: Data;
}

type Data = {
  users: ApiUser[];
};

type ApiUser = {
  uid: number;
  fname: string;
  lname: string;
  email: string;
};
