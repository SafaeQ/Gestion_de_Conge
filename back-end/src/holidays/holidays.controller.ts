import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Res,
  UseGuards,
} from '@nestjs/common';
import { HolidaysService } from './holidays.service';
import { Holiday } from 'entities/holidays';
import { HolidayDto } from 'interfaces/holiday.dto';
import { Response } from 'express';
import { REQUEST_HOLIDAY_STATUS } from 'helpers/enums';
import { DaysOffDto } from 'interfaces/daysoff.dto';
import { AuthGuard } from 'guards/admin.guard';
import { GlobalGuard } from 'guards/global.guard';
import { SupportGuard } from 'guards/support.guard';

@Controller('api/holidays')
export class HolidaysController {
  constructor(private readonly holidayService: HolidaysService) {}

  @Get()
  @UseGuards(GlobalGuard)
  async findAll(): Promise<Holiday[]> {
    try {
      return this.holidayService.findAll();
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

  // get all dates of days off in the year
  @Get('dates')
  @UseGuards(GlobalGuard)
  async findAllDates() {
    try {
      return await this.holidayService.findDaysOff();
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

  @Get(':id')
  @UseGuards(GlobalGuard)
  async findOne(@Param('id') id: number): Promise<Holiday> {
    return this.holidayService.findOne(id);
  }

  @Post('daysoff/create')
  @UseGuards(GlobalGuard)
  async createDaysOff(
    @Body('daysoff') daysoff: DaysOffDto,
    @Res() res: Response,
  ) {
    try {
      const newDate = await this.holidayService.createOffDates(daysoff);
      return res
        .status(200)
        .json({ message: 'Day Off Created', daysoff: newDate });
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

  // get requests
  @Post('tech')
  @UseGuards(GlobalGuard)
  async findAllTech(@Body('id') id: number) {
    try {
      return this.holidayService.findAllTech(id);
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

  @Post('prod')
  @UseGuards(GlobalGuard)
  async findAllProd(@Body('id') id: number) {
    try {
      return this.holidayService.findAllTech(id);
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

  @Post('create')
  @UseGuards(GlobalGuard)
  async create(@Body('holiday') holiday: HolidayDto, @Res() res: Response) {
    try {
      const newReq = await this.holidayService.create(holiday);
      return res
        .status(200)
        .json({ message: 'Reqeust Created', holiday: newReq });
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

  @Post('filter')
  @UseGuards(GlobalGuard)
  async filter(
    @Body('date') date: number,
    @Body('id') id: number,
    @Res() res: Response,
  ) {
    try {
      const filter = await this.holidayService.filterByDate(date, id);
      return res
        .status(200)
        .json({ message: 'filtering by date', data: filter });
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

  @Put('update/:id')
  @UseGuards(GlobalGuard)
  async update(
    @Param('id') id: number,
    @Body('holiday') holiday: HolidayDto,
  ): Promise<Holiday> {
    return this.holidayService.update(id, holiday);
  }

  @Put('solde/update/:id')
  @UseGuards(GlobalGuard)
  async updateSolde(
    @Param('id') id: number,
    @Body('holidayId') holidayId: number,
    @Res() res: Response,
  ) {
    try {
      const result = this.holidayService.updateSolde(id, holidayId);
      return res
        .status(200)
        .json({ message: 'filtering by date', data: result });
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: error.message,
        },
        400,
      );
    }
  }

  @Put('status/update')
  @UseGuards(GlobalGuard)
  async updateStatus(
    @Body('id') id: number,
    @Body('status') status: REQUEST_HOLIDAY_STATUS,
  ) {
    try {
      return await this.holidayService.updateStatus(id, status);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: error.message,
        },
        400,
      );
    }
  }

  @Put('status/approved/:id')
  @UseGuards(GlobalGuard)
  async status(
    @Param('id') id: number,
    @Body('isOkByHr') isOkByHr: boolean,
    @Body('isOkByChef') isOkByChef: boolean,
    @Body('isRejectByHr') isRejectByHr: boolean,
    @Body('isRejectByChef') isRejectByChef: boolean,
    @Body('userId') userId: number,
  ) {
    try {
      return await this.holidayService.statusApproved(
        id,
        isOkByHr,
        isOkByChef,
        isRejectByHr,
        isRejectByChef,
        userId,
      );
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: error.message,
        },
        400,
      );
    }
  }

  @Put('status/cancel/:id')
  @UseGuards(GlobalGuard)
  async statusCancel(@Param('id') id: number, @Body('userId') userId: number) {
    try {
      return await this.holidayService.statusCanceled(id, userId);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: error.message,
        },
        400,
      );
    }
  }

  @Put('update-holiday/:id')
  @UseGuards(GlobalGuard)
  async updatePublicHolidays(
    @Param('id') id: number,
    @Body('daysoff') daysoff: DaysOffDto,
  ) {
    try {
      return this.holidayService.updatePublicHoliday(id, daysoff);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: error.message,
        },
        400,
      );
    }
  }

  @Delete('delete-holiday/:id')
  @UseGuards(SupportGuard)
  async deletePublicHolidays(
    @Param('id') id: number,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      await this.holidayService.deletePublicHoliday(id);
      return res.status(200).json({ message: 'Public Holiday Deleted' });
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: error.message,
        },
        400,
      );
    }
  }

  @Delete('delete/:id')
  @UseGuards(AuthGuard)
  async deleteHolidays(
    @Param('id') id: number,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      await this.holidayService.deleteHoliday(id);
      return res.status(200).json({ message: 'Holiday Deleted' });
    } catch (error) {
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
