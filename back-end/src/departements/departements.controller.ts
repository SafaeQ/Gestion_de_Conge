import {
  Controller,
  Get,
  Post,
  Body,
  Res,
  Delete,
  Put,
  Param,
  HttpStatus,
  HttpException,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { DepartementsService } from './departements.service';
import { Departement } from 'entities/departements';
import { DepartementDto } from 'interfaces/departements.dto';
import { GlobalGuard } from 'guards/global.guard';

@Controller('api/departements')
@UseGuards(GlobalGuard)
export class DepartementsController {
  constructor(private readonly departementsService: DepartementsService) {}

  // find all departements
  @Get()
  findAll(): Promise<Departement[]> {
    try {
      return this.departementsService.findAll();
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

  // count all departements
  @Get('count')
  countAll(): Promise<number> {
    try {
      return this.departementsService.countAll();
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
  // find one Departement
  @Get(':id')
  async findOne(
    @Param('id') id: number,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const departement = await this.departementsService.findOne(id);
      return res.status(HttpStatus.OK).json(departement);
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
  // find paginated Departements
  @Post('find')
  findDepartements(@Body('queryParams') queryParams) {
    try {
      return this.departementsService.findDepartements(queryParams);
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
  // update Departement status in bulk
  @Post('updateStatusForDepartements')
  async updateStatusForDepartements(
    @Body('ids') ids: number[],
    @Body('status') status: string,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      await this.departementsService.updateStatusForDepartements(ids, status);
      return res.status(200).json({ message: 'Departement Deleted' });
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
  // create one Departement
  @Post('create')
  async create(
    @Body('departement') departement: DepartementDto,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const created = await this.departementsService.insert(departement);
      const newDepartement = await this.departementsService.findOne(created.id);
      return res
        .status(200)
        .json({ message: 'Departement Created', departement: newDepartement });
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
  // delete bulk entities
  @Post('delete-departements')
  async deleteDepartements(
    @Body('ids') ids: number[],
    @Res() res: Response,
  ): Promise<Response> {
    try {
      await this.departementsService.delete(ids);
      return res.status(200).json({ message: 'Departement Deleted' });
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
  // delete one Departement
  @Delete(':id')
  async delete(@Param('id') id, @Res() res: Response): Promise<Response> {
    try {
      await this.departementsService.deleteOne(id);
      return res.status(200).json({ message: 'Departement Deleted' });
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
  // updated one Departement
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body('departement') body: DepartementDto,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      await this.departementsService.update(id, body);
      const updated = await this.departementsService.findOne(id);
      return res
        .status(200)
        .json({ message: 'Departement Updated', departement: updated });
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
