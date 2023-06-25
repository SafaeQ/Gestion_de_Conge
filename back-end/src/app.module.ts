import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationModule } from 'conversations/conversations.module';
import { DepartementsModule } from 'departements/departements.module';
import { Departement } from 'entities/departements';
import { Restriction } from 'entities/restrictions';
import { User } from 'entities/user';
import { EventsModule } from 'events/events.module';
import { MessageModule } from 'messages/messages.module';
import { UsersService } from 'users/users.service';
import { EntityModule } from 'users_entities/entities.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TeamsModule } from './teams/teams.module';
import { TicketsModule } from './tickets/tickets.module';
import { UserModule } from './users/users.module';
import { ShiftsModule } from './shifts/shifts.module';
import { RecordsModule } from './records/records.module';
import { Shift } from 'entities/shifts';
import { ShiftsService } from 'shifts/shifts.service';
import { SponsorsModule } from 'sponsors/sponsors.module';
// import { ToolsModule } from 'tools/tools.module';
import { SessionsController } from './sessions/sessions.controller';
import { SessionsModule } from './sessions/sessions.module';
import { HolidaysModule } from 'holidays/holidays.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ComplaintsModule } from 'complaints/complaints.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    // loading environment variables
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    // initiating typeorm module according to the docs
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      entities: [__dirname + '/entities/*.js'],
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    //loading application modules to understand check nestjs docs https://docs.nestjs.com/
    EntityModule,
    TeamsModule,
    UserModule,
    TicketsModule,
    MessageModule,
    TypeOrmModule.forFeature([User, Restriction, Departement, Shift]),
    EventsModule,
    DepartementsModule,
    ConversationModule,
    ShiftsModule,
    RecordsModule,
    SponsorsModule,
    SessionsModule,
    HolidaysModule,
    ComplaintsModule,
    // ToolsModule,
  ],
  controllers: [AppController, SessionsController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  constructor(
    private readonly usersService: UsersService,
    private readonly shiftsService: ShiftsService,
  ) {}

  // on init create a super user for the application
  onModuleInit() {
    console.log(`Initialization...`);
    this.usersService.createSuperAdmin().then(() => {
      console.log(`Admin User Initialized`);
    });
    this.shiftsService.generateDefaultShifts().then(() => {
      console.log(`Shifts Initialized`);
    });
  }
}
