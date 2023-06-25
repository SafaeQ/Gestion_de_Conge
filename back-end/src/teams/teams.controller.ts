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
import { Team } from 'entities/teams';
import { TeamDto } from 'interfaces/team.dto';
import { TeamsService } from './teams.service';
import { AuthGuard } from 'guards/admin.guard';
import { GlobalGuard } from 'guards/global.guard';
import { IqueryParams } from 'helpers/enums';

@Controller('api/teams')
export class TeamsController {
  constructor(private readonly teamService: TeamsService) {}

  // get allTeams
  @Get()
  @UseGuards(GlobalGuard)
  findAll(): Promise<Team[]> {
    try {
      return this.teamService.findAll();
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

  // get allTeams
  @Get('count')
  @UseGuards(GlobalGuard)
  countAll(): Promise<number> {
    try {
      return this.teamService.countAll();
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

  // get one team
  @Get(':id')
  @UseGuards(AuthGuard)
  async findOne(
    @Param('id') id: number,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const team = await this.teamService.findOne(id);
      return res.status(HttpStatus.OK).json(team);
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

  // get team with paginated response
  @Post('find')
  @UseGuards(AuthGuard)
  findUsers(@Body('queryParams') queryParams: IqueryParams<Team>) {
    try {
      return this.teamService.findTeams(queryParams);
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

  // bulk status update for teams
  @Post('updateStatusForTeams')
  @UseGuards(AuthGuard)
  async updateStatusForTeams(
    @Body('ids') ids: number[],
    @Body('status') status: string,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      await this.teamService.updateStatusForTeams(ids, status);
      return res.status(200).json({ message: 'Team Deleted' });
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

  // create team
  @Post('create')
  @UseGuards(AuthGuard)
  async create(
    @Body('team') team: TeamDto,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const created = await this.teamService.insert(team);
      const newTeam = await this.teamService.findOne(created.id);
      return res.status(200).json({ message: 'Team Created', team: newTeam });
    } catch (error) {
      console.log(
        '🚀 ~ file: teams.controller.ts ~ line 114 ~ TeamsController ~ error',
        error,
      );
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: error.message,
        },
        400,
      );
    }
  }

  // bulk delete teams
  @Post('deleteTeams')
  @UseGuards(AuthGuard)
  async deleteTeams(
    @Body('ids') ids: number[],
    @Res() res: Response,
  ): Promise<Response> {
    try {
      await this.teamService.delete(ids);
      return res.status(200).json({ message: 'Team Deleted' });
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

  // delete one team
  @Delete(':id')
  @UseGuards(AuthGuard)
  async delete(@Param('id') id, @Res() res: Response): Promise<Response> {
    try {
      await this.teamService.deleteOne(id);
      return res.status(200).json({ message: 'Team Deleted' });
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

  // update team data
  @Put(':id')
  @UseGuards(AuthGuard)
  async update(
    @Param('id') id: number,
    @Body('team') body: TeamDto,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      await this.teamService.update(id, body);
      const updated = await this.teamService.findOne(id);
      return res.status(200).json({ message: 'Team Updated', team: updated });
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
