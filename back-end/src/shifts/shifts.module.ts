import { Module } from '@nestjs/common';
import { ShiftsService } from './shifts.service';
import { ShiftsController } from './shifts.controller';
import { Shift } from '../entities/shifts';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserShift } from 'entities/usershifts';

@Module({
  imports: [TypeOrmModule.forFeature([Shift, UserShift])],
  controllers: [ShiftsController],
  providers: [ShiftsService],
  exports: [ShiftsService],
})
export class ShiftsModule {}
