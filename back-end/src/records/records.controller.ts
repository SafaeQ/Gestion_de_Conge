import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  SetMetadata,
} from '@nestjs/common';
import { Res, UseGuards } from '@nestjs/common/decorators';
import { UserShift } from 'entities/usershifts';
import { GlobalGuard } from 'guards/global.guard';
import { RecordsService } from './records.service';
import { Response } from 'express';

@Controller('api/records')
@UseGuards(GlobalGuard)
export class RecordsController {
  constructor(private recordservice: RecordsService) {}

  // create records
  @Post()
  @SetMetadata('roles', ['ADMIN', 'SUPERADMIN', 'CHEF', 'TEAMLEADER'])
  async createRecords(@Body() record: UserShift[]) {
    return this.recordservice.createRecordShifts(record);
  }

  //   delete records
  @Delete('delete')
  @SetMetadata('roles', ['ADMIN', 'SUPERADMIN', 'CHEF', 'TEAMLEADER'])
  async deleteRecords(
    @Body('ids') ids: number[],
    @Body('start_date') from: string,
    @Body('end_date') to: string,
    @Res() res: Response,
  ) {
    try {
      const records = await this.recordservice.deleteRecords(
        ids,
        new Date(from).toISOString(),
        new Date(to).toISOString(),
      );
      return res.status(HttpStatus.OK).json(records);
    } catch (error) {
      console.log(error);
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: error.message,
        },
        400,
      );
    }
  }

  //   delete records
  @Delete(':id')
  @SetMetadata('roles', ['ADMIN', 'SUPERADMIN', 'CHEF', 'TEAMLEADER'])
  remove(@Param('id') id: string) {
    this.recordservice.removeRecordShifts(Number(id));
  }

  // get records
  @Get('init')
  public async getRecords(
    @Query('start_date') from: string,
    @Query('end_date') to: string,
    @Query('entity') entity: number,
    @Query('team') team: number[],
    @Query('departements') departements: number[],
  ) {
    try {
      return await this.recordservice.getInit(
        from,
        to,
        entity,
        team,
        departements, // .map((dep) => dep),
      );
    } catch (error) {
      console.log(error);
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: error.message,
        },
        400,
      );
    }
  }
}
