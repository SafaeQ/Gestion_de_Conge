import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Session } from 'entities/sessions';
import { Response } from 'express';
import { GlobalGuard } from 'guards/global.guard';
import { SessionsService } from './sessions.service';

@Controller('api/sessions')
export class SessionsController {
  constructor(private readonly sessionService: SessionsService) {}

  @Get()
  @UseGuards(GlobalGuard)
  findAll(): Promise<Session[]> {
    try {
      return this.sessionService.findSession();
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

  @Post('edit')
  @UseGuards(GlobalGuard)
  async updateSession(
    @Body('id') id: number,
    @Body('active') active: boolean,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      await this.sessionService.updateSession(id, active);
      return res.status(200).json({ message: 'Session Updated' });
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
  @Get(':id')
  @UseGuards(GlobalGuard)
  async GetSession(
    @Body('id') id: number,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const session = await this.sessionService.getOneSession(id);

      return res.status(200).json({ message: 'get one session ', session });
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

  // delete bulk sponsors
  @Post('delete')
  @UseGuards(GlobalGuard)
  async deleteSponsors(
    @Body('ids') ids: number,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      await this.sessionService.delete(ids);
      return res.status(200).json({ message: 'Session Deleted' });
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
