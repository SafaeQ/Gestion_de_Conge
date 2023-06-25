import { InjectRepository } from '@nestjs/typeorm';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { ConversationService } from 'conversations/conversations.service';
import { User } from 'entities/user';
import { MessageConversationDto, MessageDto } from 'interfaces/message.dto';
import { MessagesService } from 'messages/messages.service';
import { Server, Socket } from 'socket.io';
import { TicketsService } from 'tickets/tickets.service';
import { Repository } from 'typeorm';
import Cookies from 'universal-cookie';
import jwt_decode from 'jwt-decode';
import { USER_STATUS } from 'helpers/enums';
import { HolidaysService } from 'holidays/holidays.service';
import { ComplaintService } from 'complaints/complaints.service';
//setting up socket io
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayDisconnect {
  private readonly onlineUsers = new Map<string, boolean>();
  constructor(
    private readonly messagesService: MessagesService,
    private readonly ticketsService: TicketsService,
    private readonly holidayService: HolidaysService,
    private readonly conversationService: ConversationService,
    private readonly complaintService: ComplaintService,
    @InjectRepository(User) private user: Repository<User>,
  ) {}

  @WebSocketServer()
  server: Server;

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    const cookies = new Cookies(client.handshake.headers.cookie);
    const supportToken = cookies.get('support_access_token');

    if (supportToken) {
      const decoded: any = jwt_decode(supportToken);
      if (decoded) {
        await this.user.update(decoded.userId, {
          activity: USER_STATUS.OFFLINE,
        });
        return;
      }
    }

    const prodToken = cookies.get('prod_access_token');
    if (prodToken) {
      const decoded: any = jwt_decode(prodToken);
      if (decoded) {
        console.log('decoded offline', decoded.userId);
        await this.user.update(decoded.userId, {
          activity: USER_STATUS.OFFLINE,
        });
        return;
      }
    }
  }

  /* A socket event that is triggered when a message is created. */
  @SubscribeMessage('createMessage')
  async createMessage(
    @MessageBody() messageDto: MessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    await this.messagesService.insert(messageDto);
    await this.ticketsService.updateLastUpdated(
      Number(messageDto.ticket),
      new Date().toISOString(),
    );
    client.broadcast.emit(`messageCreated-${messageDto.ticket}`);
    client.broadcast.emit(`messageConv-${messageDto.ticket}`);
    client.emit(`ticket:message:sent`);
  }

  /* A socket event that is triggered when a ticket is forwarded. */
  @SubscribeMessage('forwardTicket')
  async forwardTicket(
    @MessageBody() ticketId: number,
    @ConnectedSocket() client: Socket,
  ) {
    const ticket = await this.ticketsService.findOne(ticketId);
    if (ticket) {
      ticket && client.broadcast.emit(`ticket-forwarded`, ticket);
    }
  }

  /* A socket event that is triggered when a ticket is created. */
  @SubscribeMessage('createTicket')
  async createTicket(
    @MessageBody() ticketId: number,
    @ConnectedSocket() client: Socket,
  ) {
    const ticket = await this.ticketsService.findOne(ticketId);
    if (ticket) {
      ticket && client.broadcast.emit(`ticket-created`, ticket);
    }
  }

  /* A socket event that is triggered when a ticket is updated. */
  @SubscribeMessage('updatedTicket')
  async updatedTicket(
    @MessageBody() ticketId: number,
    @ConnectedSocket() client: Socket,
  ) {
    const ticket = await this.ticketsService.findOne(ticketId);
    client.broadcast.emit(`ticket-updated-${ticket.id}`, ticket.status);
  }

  /* A socket event that is triggered when a ticket is updated. */
  @SubscribeMessage('bulkUpdatedTicket')
  async bulkUpdatedTicket(
    @MessageBody() ticketIds: number[],
    @ConnectedSocket() client: Socket,
  ) {
    const tickets = await this.ticketsService.findAllByIds(ticketIds);
    client.broadcast.emit(`tickets-updated`, tickets);
  }

  /* A socket event that is triggered when a message is sent. */
  @SubscribeMessage('send:message')
  async sendMessage(
    @MessageBody() message: MessageConversationDto,
    @ConnectedSocket() client: Socket,
  ) {
    const createdMessage = await this.conversationService.insert(message);
    client.broadcast.emit(`received:message`, createdMessage);
    client.broadcast.emit(`received:message:topics`, createdMessage);
    client.emit(`message:sent`);
  }

  @SubscribeMessage('user-away')
  async userAway(
    @MessageBody() data: { userId: number; activity: USER_STATUS },
  ) {
    console.log('Client connected away:', data);
    await this.user.update(data.userId, { activity: data.activity });
  }

  /* A socket event that is triggered when a client connects. */
  @SubscribeMessage('user-online')
  async userOnline(
    @MessageBody()
    data: {
      userId: number;
      activity: USER_STATUS;
      type: string;
    },
  ) {
    const user = await this.user.findOne({
      where: { id: data.userId },
    });
    if (data.activity === USER_STATUS.AWAY) {
      console.log('Client connected:', data);
      await this.user.update(data.userId, { activity: USER_STATUS.AWAY });
      return;
    }

    if (user.activity === USER_STATUS.AWAY && data.type === 'click') {
      console.log('Client connected:', data);
      await this.user.update(data.userId, { activity: data.activity });
    } else if (user.activity !== USER_STATUS.AWAY) {
      await this.user.update(data.userId, { activity: data.activity });
    }
  }

  @SubscribeMessage('requestCreated')
  async createHolidayHr(
    @MessageBody() holidayId: number,
    @ConnectedSocket() client: Socket,
  ) {
    const holiday = await this.holidayService.findOne(holidayId);
    if (holiday) {
      holiday && client.broadcast.emit(`holiday-created`, holiday);
    }
  }

  @SubscribeMessage('requestCreatedProd')
  async createHolidayProd(
    @MessageBody() holidayId: number,
    @ConnectedSocket() client: Socket,
  ) {
    const holiday = await this.holidayService.findOne(holidayId);
    if (holiday) {
      holiday && client.broadcast.emit(`holiday-created-prod`, holiday);
    }
  }

  @SubscribeMessage('requestCreatedTech')
  async createHolidayTech(
    @MessageBody() holidayId: number,
    @ConnectedSocket() client: Socket,
  ) {
    const holiday = await this.holidayService.findOne(holidayId);
    if (holiday) {
      holiday && client.broadcast.emit(`holiday-created-tech`, holiday);
    }
  }

  @SubscribeMessage('complainAdminsSeen')
  async complainTech(
    @MessageBody() data: { complaintId: number; userId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const complaint = await this.complaintService.findOne(data.complaintId);

    if (complaint) {
      client.broadcast.emit(
        `complainSeen-prod-${complaint.user.id}-${complaint.id}`,
        complaint,
      );
    }
    if (complaint) {
      client.broadcast.emit(
        `complainSeen-tech-${complaint.user.id}-${complaint.id}`,
        complaint,
      );
    }
  }

  @SubscribeMessage('complainCreatedByUser')
  async complainCreated(
    @MessageBody() complaintId: number,
    @ConnectedSocket() client: Socket,
  ) {
    const complaint = await this.complaintService.findOne(complaintId);
    if (complaint) {
      complaint && client.broadcast.emit(`complainCreated`, complaint);
    }
  }
}
