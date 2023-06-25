import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from 'entities/messages';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { MessagesMobileController } from './messagesMobile.controller';
import { MessagesMobileService } from './messagesMobile.service';
import { extname } from 'path';
import { diskStorage } from 'multer';

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
    TypeOrmModule.forFeature([Message]),
  ],
  controllers: [MessagesController, MessagesMobileController],
  providers: [MessagesService, MessagesMobileService],
})
export class MessageModule {}
