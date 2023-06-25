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
import { EntitiesService } from './entities.service';
import { MEntity } from 'entities/entities';
import { EntityDto } from 'interfaces/entity.dto';
import { User } from 'entities/user';
import { IqueryParams } from 'helpers/enums';
import { GlobalGuard } from '../guards/global.guard';

@Controller('api/entities')
@UseGuards(GlobalGuard)
export class EntityController {
  constructor(private readonly entityService: EntitiesService) {}

  // find all entities
  @Get()
  findAll(): Promise<MEntity[]> {
    try {
      return this.entityService.findAll();
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

  @Post('withusers/post')
  findAllWithUsersPost(
    @Body('access_entity') access_entity: number[],
  ): Promise<MEntity[]> {
    try {
      return this.entityService.findAllWithUsersPost(access_entity);
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

  @Get('withusers')
  findAllWithUsers(): Promise<MEntity[]> {
    try {
      return this.entityService.findAllWithUsers();
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

  @Get('api-fetch/:id')
  async fetchFromApi(
    @Param('id') id: number,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const users = await this.entityService.fetchUsersFromApi(id);
      return res.status(HttpStatus.OK).json(users);
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
  // find one entity
  @Get(':id')
  async findOne(
    @Param('id') id: number,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const entity = await this.entityService.findOne(id);
      return res.status(HttpStatus.OK).json(entity);
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
  // find paginated entities
  @Post('find')
  findUsers(@Body('queryParams') queryParams: IqueryParams<MEntity>) {
    try {
      return this.entityService.findEntities(queryParams);
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
  // find paginated entities
  @Post('syncUsers')
  async syncUsers(@Body('users') users: User[]) {
    try {
      await this.entityService.syncUsers(users);
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
  // update entity status in bulk
  @Post('updateStatusForEntities')
  async updateStatusForEntities(
    @Body('ids') ids: number[],
    @Body('status') status: string,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      await this.entityService.updateStatusForEntities(ids, status);
      return res.status(200).json({ message: 'Entity Deleted' });
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
  // create one entity
  @Post('create')
  async create(
    @Body('entity') entity: EntityDto,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const created = await this.entityService.insert(entity);
      const newEntity = await this.entityService.findOne(created.id);
      return res
        .status(200)
        .json({ message: 'Entity Created', entity: newEntity });
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
  @Post('delete-entities')
  async deleteEntities(
    @Body('ids') ids: number[],
    @Res() res: Response,
  ): Promise<Response> {
    try {
      await this.entityService.delete(ids);
      return res.status(200).json({ message: 'Entity Deleted' });
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
  // delete one entity
  @Delete(':id')
  async delete(@Param('id') id, @Res() res: Response): Promise<Response> {
    try {
      await this.entityService.deleteOne(id);
      return res.status(200).json({ message: 'Entity Deleted' });
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
  // updated one entity
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body('entity') body: EntityDto,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      await this.entityService.update(id, body);
      const updated = await this.entityService.findOne(id);
      return res
        .status(200)
        .json({ message: 'Entity Updated', entity: updated });
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
