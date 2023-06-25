import {
  Controller,
  Get,
  Param,
  HttpStatus,
  HttpException,
  UseGuards,
  Query,
} from '@nestjs/common';
// import { Message } from 'entities/messages';
import { GlobalGuard } from 'guards/global.guard';
import { MessagesMobileService } from './messagesMobile.service';

@Controller('api/mobile/messages')
@UseGuards(GlobalGuard)
export class MessagesMobileController {
  constructor(private readonly messagesMobileService: MessagesMobileService) {}

  // endpoint  to get ticket messages , and update messages read array to add user id
  @Get(':ticket/:user')
  async findAll(
    @Param('ticket') ticket: number,
    @Param('user') user: number,
    @Query('pageCurrent') pageCurrent: number,
    @Query('pageSize') pageSize: number,
  ) {
    try {
      return await this.messagesMobileService.findAll(
        ticket,
        user,
        pageCurrent,
        pageSize,
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
}
