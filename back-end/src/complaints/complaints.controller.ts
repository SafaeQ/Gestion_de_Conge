import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Res,
} from '@nestjs/common';
import { ComplaintService } from './complaints.service';
import { Complaint } from 'entities/complaint';
import { ComplaintDto } from 'interfaces/complaint.dto';
import { Response } from 'express';

@Controller('api/complaints')
export class ComplaintController {
  constructor(private readonly complaintService: ComplaintService) {}

  @Get()
  async findAll(): Promise<Complaint[]> {
    try {
      return this.complaintService.findAll();
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
  async findOne(@Param('id') id: number): Promise<Complaint> {
    return this.complaintService.findOne(id);
  }

  @Post('create')
  async create(
    @Body('complaint') complaint: ComplaintDto,
    @Res() res: Response,
  ) {
    try {
      const newReq = await this.complaintService.create(complaint);
      return res
        .status(200)
        .json({ message: 'Reqeust Created', complaint: newReq });
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

  // get complait of users that belongs to entity's chef
  @Post('chef')
  async findAllComplaint(@Body('id') id: number) {
    try {
      return this.complaintService.findAllComplaint(id);
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

  @Put('seen/:id')
  async updateSeen(@Param('id') id: number, @Body('seen') seen: boolean) {
    try {
      return this.complaintService.markAsSeen(id, seen);
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

  @Put('edit/:id')
  async update(
    @Param('id') id: number,
    @Body('complaint') complaint: ComplaintDto,
  ) {
    try {
      return this.complaintService.updateComplaint(id, complaint);
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
