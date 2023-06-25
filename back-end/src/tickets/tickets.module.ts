import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from 'entities/messages';
import { Ticket } from 'entities/tickets';
import { User } from 'entities/user';
import { MessagesService } from 'messages/messages.service';
import { MessagesMobileService } from 'messages/messagesMobile.service';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { TicketsMobileController } from './ticketsMobile.controller';
import { TicketsMobileService } from './ticketsMobile.service';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket, Message, User])],
  controllers: [TicketsController, TicketsMobileController],
  providers: [
    TicketsService,
    MessagesService,
    TicketsMobileService,
    MessagesMobileService,
  ],
})
export class TicketsModule {}
