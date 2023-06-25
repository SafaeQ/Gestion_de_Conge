import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MEntity } from 'entities/entities';
import { Tool } from 'entities/tools';
import { ToolsController } from './tools.controller';
import { ToolsService } from './tools.service';

@Module({
  imports: [TypeOrmModule.forFeature([Tool, MEntity])],
  controllers: [ToolsController],
  providers: [ToolsService],
})
export class ToolsModule {}
