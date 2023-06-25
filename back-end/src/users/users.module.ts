import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Departement } from 'entities/departements';
import { Restriction } from 'entities/restrictions';
import { Session } from 'entities/sessions';
import { User } from 'entities/user';
import { SessionsService } from 'sessions/sessions.service';
import { AuthUserController } from './auth.controller';
import { UserController } from './users.controller';
import { UsersService } from './users.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Restriction, Departement, Session]),
    ScheduleModule.forRoot(),
  ],
  controllers: [UserController, AuthUserController],
  providers: [UsersService, SessionsService],
  exports: [UsersService],
})
export class UserModule {}
