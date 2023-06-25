import { IsDefined, IsString, IsNotEmpty, IsNumber } from 'class-validator';
import { User } from 'entities/user';
import { Ticket } from 'entities/tickets';
import { Topic } from 'entities/topics';
// entity data transfer object with validation using class-validator
export class MessageDto {
  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  user: User;

  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  ticket: Ticket;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  body: string;
}

export class MessageConversationDto {
  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  from: User;

  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  to: User;

  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  topic: Topic;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  msg: string;
}

export class ConversationTopicDto {
  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  from: User;

  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  to: User;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  subject: string;
}
