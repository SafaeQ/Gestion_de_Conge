import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Holiday } from 'entities/holidays';
import { User } from 'entities/user';
import { HolidaysController } from './holidays.controller';
import { HolidaysService } from './holidays.service';
import { Daysoff } from 'entities/daysoff';

@Module({
  imports: [TypeOrmModule.forFeature([Holiday, User, Daysoff])],
  controllers: [HolidaysController],
  providers: [HolidaysService],
})
export class HolidaysModule {}
