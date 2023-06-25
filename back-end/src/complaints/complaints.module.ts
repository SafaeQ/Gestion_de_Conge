import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComplaintService } from './complaints.service';
import { ComplaintController } from './complaints.controller';
import { Complaint } from 'entities/complaint';
import { User } from 'entities/user';

@Module({
  imports: [TypeOrmModule.forFeature([Complaint, User])],
  controllers: [ComplaintController],
  providers: [ComplaintService],
})
export class ComplaintsModule {}
