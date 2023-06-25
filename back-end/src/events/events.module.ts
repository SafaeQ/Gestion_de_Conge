import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationService } from 'conversations/conversations.service';
import { Conversation } from 'entities/conversations';
import { Message } from 'entities/messages';
import { Ticket } from 'entities/tickets';
import { Topic } from 'entities/topics';
import { User } from 'entities/user';
import { MessagesService } from 'messages/messages.service';
import { TicketsService } from 'tickets/tickets.service';
import { EventsGateway } from './events.gateway';
import { Holiday } from 'entities/holidays';
import { HolidaysService } from 'holidays/holidays.service';
import { Daysoff } from 'entities/daysoff';
import { ComplaintService } from 'complaints/complaints.service';
import { Complaint } from 'entities/complaint';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Message,
      Ticket,
      User,
      Conversation,
      Topic,
      Holiday,
      Daysoff,
      Complaint
    ]),
  ],
  providers: [
    EventsGateway,
    MessagesService,
    TicketsService,
    ConversationService,
    HolidaysService,
    ComplaintService,
  ],
})
export class EventsModule {}
