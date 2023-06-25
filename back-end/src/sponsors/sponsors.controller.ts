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
  Headers,
} from '@nestjs/common';
import { Response } from 'express';
import { SponsorsService } from './sponsors.service';
import { Sponsor } from 'entities/sponsors';
import { IqueryParams } from 'helpers/enums';
import { JwtAuthGuard } from 'guards/sponsors.guard';
import { AuthGuard } from 'guards/admin.guard';
import { GlobalGuard } from 'guards/global.guard';
import { verify } from 'jsonwebtoken';

@Controller('api/sponsors')
export class SponsorsController {
  constructor(private readonly sponsorsService: SponsorsService) {}

  // find all sponsors
  @Get()
  @UseGuards(GlobalGuard)
  findAllSponsors(): Promise<Sponsor[]> {
    try {
      return this.sponsorsService.findAllSponsors();
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

  // find all sponsors
  @Post('byentity')
  @UseGuards(JwtAuthGuard)
  findAllGroupByEntity(
    @Headers('authorization') token: string,
    @Body('entityId') entityId: number,
  ) {
    try {
      const access_token = token?.split(' ')[1];
      const decoded: any = verify(
        access_token,
        process.env.ACCESS_TOKEN_SECRET,
      );
      return this.sponsorsService.findAllGroupByEntity(
        entityId,
        decoded?.access_entity,
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

  // find all sponsors
  @Post()
  @UseGuards(JwtAuthGuard)
  findAllByEntity(@Body('entityId') entityId: number): Promise<Sponsor[]> {
    try {
      return this.sponsorsService.findAllByEntity(entityId);
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
  // find one sponsor
  @Get('one/:id')
  @UseGuards(JwtAuthGuard)
  async findOneSponsor(
    @Param('id') id: number,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const sponsor = await this.sponsorsService.findOne(id);
      return res.status(HttpStatus.OK).json(sponsor);
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
  // find one sponsor
  @Get(':id')
  @UseGuards(GlobalGuard)
  async findOne(
    @Param('id') id: number,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const sponsor = await this.sponsorsService.findOneAdmin(id);
      return res.status(HttpStatus.OK).json(sponsor);
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
  // find paginated sponsors
  @Post('find')
  @UseGuards(AuthGuard)
  findDepartements(@Body('queryParams') queryParams: IqueryParams<Sponsor>) {
    try {
      return this.sponsorsService.findSponsors(queryParams);
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
  // update Sponsors status in bulk
  @Post('updateStatusForSponsors')
  @UseGuards(GlobalGuard)
  async updateStatusForSponsors(
    @Body('ids') ids: number[],
    @Body('status') status: string,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      await this.sponsorsService.updateStatusForSponsors(ids, status);
      return res.status(200).json({ message: 'Sponsor Deleted' });
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
  // create one sponsor
  @Post('create')
  @UseGuards(GlobalGuard)
  async create(
    @Body('sponsor') sponsor: Sponsor,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      await this.sponsorsService.insert(sponsor);
      return res.status(200).json({ message: 'Sponsor Created' });
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
  // delete bulk sponsors
  @Post('delete-sponsors')
  @UseGuards(GlobalGuard)
  async deleteSponsors(
    @Body('ids') ids: number[],
    @Res() res: Response,
  ): Promise<Response> {
    try {
      await this.sponsorsService.delete(ids);
      return res.status(200).json({ message: 'Sponsor Deleted' });
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
  // delete one sponsor
  @Delete(':id')
  @UseGuards(GlobalGuard)
  async delete(
    @Param('id') id: number,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      await this.sponsorsService.deleteOne(id);
      return res.status(200).json({ message: 'Sponsor Deleted' });
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
  // updated one sponsor
  @Put(':id')
  @UseGuards(GlobalGuard)
  async update(
    @Param('id') id: number,
    @Body('sponsor') body: Sponsor,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      await this.sponsorsService.update(id, body);
      return res.status(200).json({ message: 'Sponsor Updated' });
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
