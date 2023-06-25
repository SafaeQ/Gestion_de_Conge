import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  SetMetadata,
} from '@nestjs/common';
import { UseGuards } from '@nestjs/common/decorators';
import { GlobalGuard } from 'guards/global.guard';
import { shiftDto } from 'interfaces/shift.dto';
import { ShiftsService } from './shifts.service';

@Controller('api/shifts')
@UseGuards(GlobalGuard)
export class ShiftsController {
  constructor(private readonly shiftservice: ShiftsService) {}

  //   find all shifts
  @Get()
  @SetMetadata('roles', ['ADMINISTRATION', 'SUPERADMIN', 'CHEF', 'TEAMLEADER'])
  findShifts() {
    return this.shiftservice.getAllShifts();
  }
  //   count all shifts
  @Get('count')
  @SetMetadata('roles', ['ADMINISTRATION', 'SUPERADMIN', 'CHEF', 'TEAMLEADER'])
  countShifts(): Promise<number> {
    return this.shiftservice.countAll();
  }

  //   create a new shift
  @Post()
  @SetMetadata('roles', ['ADMINISTRATION', 'SUPERADMIN', 'CHEF', 'TEAMLEADER'])
  async create(@Body() shift: shiftDto) {
    return this.shiftservice.createShifts(shift);
  }

  //   delete a shift
  @Post(':id')
  @SetMetadata('roles', ['ADMINISTRATION', 'SUPERADMIN', 'CHEF', 'TEAMLEADER'])
  remove(@Param('id') id: number, @Body('deleted') deleted: boolean) {
    return this.shiftservice.deleteShifts(Number(id), deleted);
  }
}
