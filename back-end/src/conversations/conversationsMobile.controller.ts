import {
  Controller,
  Get,
  HttpStatus,
  HttpException,
  UseGuards,
  Query,
  Param,
  Body,
  Post,
  Put,
  UseInterceptors,
  BadRequestException,
  UploadedFile,
} from '@nestjs/common';
import { GlobalGuard } from 'guards/global.guard';
import { Conversation } from 'entities/conversations';
import { ConversationTopicDto } from 'interfaces/message.dto';
import { TOPIC_STATUS } from 'helpers/enums';
import { FileInterceptor } from '@nestjs/platform-express';
import isImage from 'utils/is-image';
import { Topic } from 'entities/topics';
import { User } from 'entities/user';
import { renameSync } from 'fs';
import { ConversationMobileService } from './conversationsMobile.service';

@Controller('api/mobile/conversations')
@UseGuards(GlobalGuard)
export class ConversationsMobileController {
  constructor(
    private readonly conversationMobileService: ConversationMobileService,
  ) {}

  /**
   * It returns an array of all the conversations in the database
   * @returns An array of conversations
   */
  @Get('all')
  async findAllConversations(): Promise<Conversation[]> {
    try {
      return await this.conversationMobileService.getAllConversations();
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

  /**
   * It takes in two query parameters, me and topic, and returns an array of Conversation objects
   * @param {number} me - number - the user id of the user who is logged in
   * @param {number} topic - number - the topic id
   * @returns An array of conversations
   */
  @Get()
  async findAll(
    @Query('me') me: number,
    @Query('topic') topic: number,
  ): Promise<Conversation[]> {
    try {
      return await this.conversationMobileService.findAll(me, topic);
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

  /**
   * It returns all the unread messages of the user with the id passed in the request
   * @param {number} me - number
   * @returns An array of unread messages
   */
  @Get('unread/:me')
  async findAllUnreadMessages(@Param('me') me: number) {
    try {
      return await this.conversationMobileService.findAllUnreadMessages(me);
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

  @Get('topics')
  async findAllTopics(
    @Query('pageCurrent') pageCurrent: number,
    @Query('pageSize') pageSize: number,
    @Query('valueDate') valueDate?: string,
    @Query('valueId') valueId?: string,
  ) {
    try {
      return await this.conversationMobileService.getAllTopics(
        pageCurrent,
        pageSize,
        valueDate,
        valueId,
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

  @Get('topics/:me')
  async findTopics(
    @Param('me') me: number,
    @Query('pageCurrent') pageCurrent?: number,
    @Query('pageSize') pageSize?: number,
    @Query('valueDate') valueDate?: string,
    @Query('valueId') valueId?: string,
  ) {
    try {
      return await this.conversationMobileService.getTopics(
        me,
        pageCurrent,
        pageSize,
        valueDate,
        valueId,
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

  @Get('chats/:me')
  async findAllChat(@Param('me') me: number) {
    try {
      return await this.conversationMobileService.findAllChat(me);
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

  @Put('topics/update/:id')
  async completedTopic(
    @Param('id') topic: number,
    @Body('status') status: TOPIC_STATUS,
    @Body('updatedby') updatedby: number,
  ) {
    try {
      return await this.conversationMobileService.updateTopicStatus(
        topic,
        status,
        updatedby,
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

  @Post('topics/create')
  async createTopic(@Body('topic') topic: ConversationTopicDto) {
    try {
      await this.conversationMobileService.insertTopic(topic);
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
  @Post('upload/:topicId')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('topicId') topicId: Topic,
    @Body('from') from: User,
    @Body('to') to: User,
  ) {
    try {
      const conv = await this.conversationMobileService.insert({
        msg: '',
        topic: topicId,
        from,
        to,
      });
      renameSync(
        `./files/${file.filename}`,
        `./files/${conv.id}-${file.originalname.replace(/\s/g, '')}`,
      );
      let filename = '';
      if (isImage(file.originalname)) {
        filename = `image:${conv.id}-${file.originalname.replace(/\s/g, '')}`;
      } else {
        filename = `file:${conv.id}-${file.originalname.replace(/\s/g, '')}`;
      }
      await this.conversationMobileService.updateConversation({
        ...conv,
        msg: filename,
      });
      return { message: 'created' };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('topics/counts/:me')
  async topiCountAdmin(@Param('me') me: number) {
    try {
      return await this.conversationMobileService.getTopicsCountAdmin();
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

  @Get('topics/count/:me')
  async topiCount(@Param('me') me: number) {
    try {
      return await this.conversationMobileService.getTopicsCount(me);
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
