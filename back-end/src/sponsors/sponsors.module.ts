import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MEntity } from 'entities/entities';
import { Sponsor } from 'entities/sponsors';
import { SponsorsController } from './sponsors.controller';
import { SponsorsService } from './sponsors.service';

@Module({
  imports: [TypeOrmModule.forFeature([Sponsor, MEntity])],
  controllers: [SponsorsController],
  providers: [SponsorsService],
})
export class SponsorsModule {}
