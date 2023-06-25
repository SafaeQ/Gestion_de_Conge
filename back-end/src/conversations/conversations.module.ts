import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from 'entities/conversations';
import { Topic } from 'entities/topics';
import { User } from 'entities/user';
import { ConversationsController } from './conversations.controller';
import { ConversationService } from './conversations.service';
import { ConversationsMobileController } from './conversationsMobile.controller';
import { ConversationMobileService } from './conversationsMobile.service';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: (req, file, cb) => {
          // Check file type
          const isImage = file.mimetype.startsWith('image/');
          const uploadPath = isImage ? './images' : './files';
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          // Generate unique filename
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const fileExt = extname(file.originalname);
          cb(null, file.fieldname + '-' + uniqueSuffix + fileExt);
        },
      }),
    }),
    TypeOrmModule.forFeature([Conversation, Topic, User]),
  ],
  controllers: [ConversationsController, ConversationsMobileController],
  providers: [ConversationService, ConversationMobileService],
})
export class ConversationModule {}
