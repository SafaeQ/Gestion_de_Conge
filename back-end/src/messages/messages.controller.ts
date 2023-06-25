import {
  Controller,
  Get,
  Post,
  Param,
  HttpStatus,
  HttpException,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Body,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { Message } from 'entities/messages';
import { GlobalGuard } from 'guards/global.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Ticket } from 'entities/tickets';
import { User } from 'entities/user';
import isImage from 'utils/is-image';
import { rename } from 'fs/promises';

@Controller('api/messages')
@UseGuards(GlobalGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  // endpoint  to get ticket messages , and update messages read array to add user id
  @Get(':ticket/:user')
  async findAll(
    @Param('ticket') ticket: number,
    @Param('user') user: number,
  ): Promise<Message[]> {
    try {
      return await this.messagesService.findAll(ticket, user);
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
  @Post('upload/:id')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('id') user: User,
    @Body('ticketId') ticketId: Ticket,
  ) {
    console.log(file);

    try {
      const msg = await this.messagesService.insert({
        body: '',
        ticket: ticketId,
        user,
      });

      let filename = '';
      if (isImage(file.originalname)) {
        await rename(
          `./images/${file.filename}`,
          `./images/${msg.id}-${file.originalname.replace(/\s/g, '')}`,
        );
        filename = `image:${msg.id}-${file.originalname.replace(/\s/g, '')}`;
      } else {
        await rename(
          `./files/${file.filename}`,
          `./files/${msg.id}-${file.originalname.replace(/\s/g, '')}`,
        );
        filename = `file:${msg.id}-${file.originalname.replace(/\s/g, '')}`;
      }
      await this.messagesService.update(msg.id, {
        ...msg,
        body: filename,
      });
      return { message: 'created' };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
