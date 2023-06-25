import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Departement } from 'entities/departements';
import { DepartementsController } from './departements.controller';
import { DepartementsService } from './departements.service';

@Module({
  imports: [TypeOrmModule.forFeature([Departement])],
  controllers: [DepartementsController],
  providers: [DepartementsService],
})
export class DepartementsModule {}
