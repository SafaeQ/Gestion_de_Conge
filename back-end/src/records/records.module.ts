import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserShift } from 'entities/usershifts';
import { RecordsController } from './records.controller';
import { RecordsService } from './records.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserShift])],
  controllers: [RecordsController],
  providers: [RecordsService]
})
export class RecordsModule {}
