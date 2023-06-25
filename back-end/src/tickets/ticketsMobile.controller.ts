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
import { IqueryParams, TICKET_STATUS } from '../helpers/enums';
import { AuthGuard } from 'guards/admin.guard';
import { GlobalGuard } from 'guards/global.guard';
import { User } from 'entities/user';
import { TicketsMobileService } from './ticketsMobile.service';
import { MessagesMobileService } from 'messages/messagesMobile.service';

@Controller('api/mobile/tickets')
export class TicketsMobileController {
  constructor(
    private readonly ticketsMobileService: TicketsMobileService,
    private readonly MessageMobileService: MessagesMobileService,
  ) {}

  // find all tickets
  @Get()
  @UseGuards(AuthGuard)
  findAll(): Promise<Ticket[]> {
    try {
      return this.ticketsMobileService.findAll();
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
      const team = await this.ticketsMobileService.findOne(id);
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
  findAdminTickets(
    @Body('queryParams') queryParams,
    @Query('pageCurrent') pageCurrent: number,
    @Query('pageSize') pageSize: number,
    @Query('valueId') valueId?: string,
    @Query('valueDate') valueDate?: string,
  ) {
    try {
      return this.ticketsMobileService.findTickets(
        queryParams,
        pageCurrent,
        pageSize,
        valueId,
        valueDate,
      );
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
  findTechTickets(
    @Body('queryParams') queryParams: IqueryParams<Ticket>,
    @Query('pageCurrent') pageCurrent: number,
    @Query('pageSize') pageSize: number,
    @Query('valueId') valueId?: string,
    @Query('valueDate') valueDate?: string,
  ) {
    try {
      return this.ticketsMobileService.findTechTickets(
        queryParams,
        pageCurrent,
        pageSize,
        valueId,
        valueDate,
      );
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
  findTickets(
    @Body('queryParams') queryParams: IqueryParams<Ticket>,
    @Query('pageCurrent') pageCurrent: number,
    @Query('pageSize') pageSize: number,
    @Query('valueId') valueId?: string,
    @Query('valueDate') valueDate?: string,
  ) {
    try {
      return this.ticketsMobileService.findGlobalTickets(
        queryParams,
        pageCurrent,
        pageSize,
        valueId,
        valueDate,
      );
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
      await this.ticketsMobileService.updateStatusForTickets(
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
      const createdTicket = await this.ticketsMobileService.insert(ticket);

      //insert first message
      await this.MessageMobileService.insert({
        user: createdTicket.user,
        ticket: createdTicket,
        body: createdTicket.body,
      });

      // get populated fields
      const newTicket = await this.ticketsMobileService.findOne(
        createdTicket.id,
      );
      // update first msg to read by isssuer id
      await this.ticketsMobileService.updateRead(
        newTicket.user.id,
        newTicket.id,
      );
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
      await this.ticketsMobileService.delete(ids);
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
      await this.ticketsMobileService.deleteOne(id);
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
      await this.ticketsMobileService.update(id, body);
      const updated = await this.ticketsMobileService.findOne(id);
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
  // @Post('search')
  // async searchMessages(
  //   @Query('body') body: string,
  //   @Body('queryParams') queryParams: IqueryParams<Ticket>,
  // ) {
  //   try {
  //     return await this.ticketsMobileService.search(body, queryParams);
  //   } catch (error) {
  //     throw new HttpException(
  //       {
  //         status: HttpStatus.BAD_REQUEST,
  //         error: error.message,
  //       },
  //       400,
  //     );
  //   }
  // }

  @Post('open')
  async findAllUnreadMessages(
    @Res() res: Response,
    @Body('queryParams') queryParams,
  ): Promise<Response<number>> {
    try {
      const unReadMessagesCount =
        await this.ticketsMobileService.getCountUnreadMsgTicket(queryParams);
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

  // this api for support
  @Post('count/tech')
  async ticketCountbyStatusT(
    @Body('queryParams') queryParams: IqueryParams<Ticket>,
  ) {
    try {
      return await this.ticketsMobileService.ticketsCountTech(queryParams);
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

  // this api for prd
  @Post('count/prod')
  async ticketCountbyStatusP(
    @Body('queryParams') queryParams: IqueryParams<Ticket>,
  ) {
    try {
      return await this.ticketsMobileService.ticketsCountProd(queryParams);
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

  // this api for admin
  @Post('count/admin')
  async ticketCountbyStatusA(
    @Body('queryParams') queryParams: IqueryParams<Ticket>,
  ) {
    try {
      return await this.ticketsMobileService.ticketsCountAdmin(queryParams);
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

  //*****************? return array of ids for notifee in frontend ?******************//

  @Post('admin/ids')
  @UseGuards(GlobalGuard)
  ticketsIdAdmin(@Body('queryParams') queryParams) {
    try {
      return this.ticketsMobileService.getTicketsIdAdmin(queryParams);
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
  @Post('tech/ids')
  @UseGuards(GlobalGuard)
  ticketsIdsTech(@Body('queryParams') queryParams: IqueryParams<Ticket>) {
    try {
      return this.ticketsMobileService.getTicketsIdsTech(queryParams);
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
  @Post('prod/ids')
  @UseGuards(GlobalGuard)
  ticketsIdProd(@Body('queryParams') queryParams: IqueryParams<Ticket>) {
    try {
      return this.ticketsMobileService.getTicketsIdsProd(queryParams);
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
