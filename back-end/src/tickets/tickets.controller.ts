import {
  Controller,
  Get,
  Post,
  Body,
  Res,
  Delete,
  Put,
  Param,
  HttpStatus,
  HttpException,
  UseGuards,
  Query,
} from '@nestjs/common';
import { Response } from 'express';
import { Ticket } from 'entities/tickets';
import { TicketDto, UpdateTicketDto } from 'interfaces/ticket.dto';
import { TicketsService } from './tickets.service';
import { IqueryParams, TICKET_STATUS } from '../helpers/enums';
import { MessagesService } from 'messages/messages.service';
import { AuthGuard } from 'guards/admin.guard';
import { GlobalGuard } from 'guards/global.guard';
import { User } from 'entities/user';

@Controller('api/tickets')
export class TicketsController {
  constructor(
    private readonly ticketsService: TicketsService,
    private readonly MessageService: MessagesService,
  ) {}

  // find all tickets
  @Get()
  @UseGuards(AuthGuard)
  findAll(): Promise<Ticket[]> {
    try {
      return this.ticketsService.findAll();
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: error.message,
        },
        400,
      );
    }
  }

  // count all tickets
  @Get('count')
  @UseGuards(AuthGuard)
  countAllTickets() {
    try {
      return this.ticketsService.countAllPerMonth();
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: error.message,
        },
        400,
      );
    }
  }

  // get one ticket
  @Get(':id')
  @UseGuards(GlobalGuard)
  async findOne(
    @Param('id') id: number,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const team = await this.ticketsService.findOne(id);
      return res.status(HttpStatus.OK).json(team);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: error.message,
        },
        400,
      );
    }
  }
  /* this route is used for admin users 
     maybe in the future will get more info about ticket that not available to other user
    */
  @Post('find')
  @UseGuards(GlobalGuard)
  findGlobalTickets(@Body('queryParams') queryParams) {
    try {
      return this.ticketsService.findTickets(queryParams);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: error.message,
        },
        400,
      );
    }
  }
  // find tickets filtered for support
  @Post('tech/find')
  @UseGuards(GlobalGuard)
  findTechTickets(@Body('queryParams') queryParams: IqueryParams<Ticket>) {
    try {
      return this.ticketsService.findTechTickets(queryParams);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: error.message,
        },
        400,
      );
    }
  }

  /* 
      this route is used for others users roles that are not admin
    */
  @Post('global/find')
  @UseGuards(GlobalGuard)
  findTickets(@Body('queryParams') queryParams: IqueryParams<Ticket>) {
    try {
      return this.ticketsService.findGlobalTickets(queryParams);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: error.message,
        },
        400,
      );
    }
  }

  // bulk ticket status update
  @Post('updateStatusForTickets')
  @UseGuards(GlobalGuard)
  async updateStatusForTickets(
    @Body('ids') ids: number[],
    @Body('assigned_to') assigned_to: User,
    @Body('status') status: TICKET_STATUS,
    @Body('closed_by') closed_by: string,
    @Body('resolved_by') resolved_by: string,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      await this.ticketsService.updateStatusForTickets(
        ids,
        assigned_to,
        status,
        closed_by,
        resolved_by,
      );
      return res.status(200).json({ message: 'Ticket Updated' });
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: error.message,
        },
        400,
      );
    }
  }

  @UseGuards(GlobalGuard)
  @Post('create')
  async create(
    @Body('ticket') ticket: TicketDto,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      //create ticket
      const createdTicket = await this.ticketsService.insert(ticket);

      //insert first message
      await this.MessageService.insert({
        user: createdTicket.user,
        ticket: createdTicket,
        body: createdTicket.body,
      });

      // get populated fields
      const newTicket = await this.ticketsService.findOne(createdTicket.id);
      // update first msg to read by isssuer id
      await this.ticketsService.updateRead(newTicket.user.id, newTicket.id);
      return res
        .status(200)
        .json({ message: 'Ticket Created', ticket: newTicket });
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: error.message,
        },
        400,
      );
    }
  }

  // bulk delete
  @UseGuards(AuthGuard)
  @Post('deleteTickets')
  async deleteTickets(
    @Body('ids') ids: number[],
    @Res() res: Response,
  ): Promise<Response> {
    try {
      await this.ticketsService.delete(ids);
      return res.status(200).json({ message: 'Tickets Deleted' });
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: error.message,
        },
        400,
      );
    }
  }

  // delete one ticket
  @Delete(':id')
  @UseGuards(AuthGuard)
  async delete(
    @Param('id') id: number,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      await this.ticketsService.deleteOne(id);
      return res.status(200).json({ message: 'Ticket Deleted' });
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: error.message,
        },
        400,
      );
    }
  }

  // update ticket
  @Put(':id')
  @UseGuards(GlobalGuard)
  async update(
    @Param('id') id: number,
    @Body('ticket') body: UpdateTicketDto,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      await this.ticketsService.update(id, body);
      const updated = await this.ticketsService.findOne(id);
      return res
        .status(200)
        .json({ message: 'Ticket Updated', ticket: updated });
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: error.message,
        },
        400,
      );
    }
  }

  // search messages?
  @Post('search')
  async searchMessages(
    @Query('body') body: string,
    @Body('queryParams') queryParams: IqueryParams<Ticket>,
  ) {
    try {
      return await this.ticketsService.search(body, queryParams);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: error.message,
        },
        400,
      );
    }
  }
  // search messages
  @Post('admin/search')
  async searchMessagesForAdmin(
    @Query('body') body: string,
    @Body('queryParams') queryParams: IqueryParams<Ticket>,
  ) {
    try {
      console.log(body, queryParams);

      return await this.ticketsService.searchAdmin(body, queryParams);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: error.message,
        },
        400,
      );
    }
  }

  @Post('pinned')
  async pinnedTickets(
    @Body('id') id: number,
    @Body('pinned') pinned: boolean,
    @Res() res: Response,
  ) {
    try {
      const pinTicket = await this.ticketsService.pin(id, pinned);
      return res
        .status(200)
        .send({ message: 'Ticket Pinned', data: pinTicket });
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: error.message,
        },
        400,
      );
    }
  }

  @Post('open')
  async findAllUnreadMessages(
    @Res() res: Response,
    @Body('queryParams') queryParams,
  ): Promise<Response<number>> {
    try {
      const unReadMessagesCount =
        await this.ticketsService.getCountUnreadMsgTicket(queryParams);
      return res.status(200).send(unReadMessagesCount.toString());
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: error.message,
        },
        400,
      );
    }
  }
}
