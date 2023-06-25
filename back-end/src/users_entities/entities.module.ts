import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MEntity } from 'entities/entities';
import { EntityController } from './entities.controller';
import { EntitiesService } from './entities.service';
import { User } from 'entities/user';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([MEntity, User])],
  controllers: [EntityController],
  providers: [EntitiesService],
})
export class EntityModule {}
