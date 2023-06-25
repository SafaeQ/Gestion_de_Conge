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
  Query,
} from '@nestjs/common';
import { Response } from 'express';
import { User } from 'entities/user';
import {
  UpdateUserDto,
  UserDto,
  UserRestrictionDto,
} from 'interfaces/user.dto';
import { UsersService } from './users.service';
import { AuthGuard } from 'guards/admin.guard';
import { GlobalGuard } from 'guards/global.guard';
import { genSaltSync, hashSync } from 'bcryptjs';
import { USER_STATUS } from 'helpers/enums';

@Controller('api/users')
export class UserController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  @UseGuards(GlobalGuard)
  findAll(): Promise<User[]> {
    try {
      return this.userService.findAll();
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

  @Get('count')
  @UseGuards(GlobalGuard)
  countAll(): Promise<number> {
    try {
      return this.userService.countAllUsers();
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

  // get filtered users by team or entity
  @Get('filter')
  // @UseGuards(GlobalGuard)
  findFiltersAll(
    @Query('entity') entity: number,
    @Query('team') team: number,
  ): Promise<User[]> {
    try {
      return this.userService.findFiltersAll({
        entity: Number(entity),
        team: Number(team),
      });
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

  // get filtered users by team or entity
  @Get('filtering')
  @UseGuards(GlobalGuard)
  findFiltersAll2(
    @Query('entity') entity: number,
    @Query('team') team: number,
    @Query('departements') departements: string[],
  ): Promise<User[]> {
    try {
      return this.userService.findFiltersAll2(
        Number(entity),
        team,
        departements.map((dep) => parseInt(dep)),
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

  // get users with role of chef
  @Get('chef')
  @UseGuards(GlobalGuard)
  findAllChefUsers(): Promise<User[]> {
    try {
      return this.userService.findAllChefUsers();
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

  @Get('support')
  @UseGuards(GlobalGuard)
  findAllSupportfUsers(): Promise<User[]> {
    try {
      return this.userService.findAllSupportUsers();
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

  // get users with role of teamleader
  @Get('teamleader')
  @UseGuards(GlobalGuard)
  findTeamLeaderUsers(): Promise<User[]> {
    try {
      return this.userService.findTeamLeaderUsers();
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

  // get users with role of teamleader
  @Get('all')
  @UseGuards(GlobalGuard)
  findTeamChefLeaderUsers(): Promise<User[]> {
    try {
      return this.userService.findTeamChefLeaderUsers();
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

  // get one User
  @Get(':id')
  @UseGuards(AuthGuard)
  async findOne(
    @Param('id') id: number,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const user = await this.userService.findOne(id);
      return res.status(HttpStatus.OK).json(user);
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

  @Post('access_entity')
  @UseGuards(GlobalGuard)
  findUsersForHr(
    @Body('access_entity_hr') access_entity_hr: number[],
  ): Promise<User[]> {
    try {
      return this.userService.findUsersByAccessEntity(access_entity_hr);
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

  // get paginated users result
  @Post('find')
  @UseGuards(AuthGuard)
  findUsers(@Body('queryParams') queryParams) {
    try {
      return this.userService.findUsers(queryParams);
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

  // create user
  @Post('create')
  @UseGuards(AuthGuard)
  async create(
    @Body('user') user: UserDto,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const createdUser = await this.userService.insert(user);
      const newUser = await this.userService.findOne(createdUser.id);
      return res.status(200).json({ message: 'User Created', user: newUser });
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

  @Post('create-restriction')
  @UseGuards(AuthGuard)
  async createRestriction(
    @Body('restriction') restriction: UserRestrictionDto,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      await this.userService.createRestriction(restriction);
      return res.status(200).json({ message: 'Restriction Created' });
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

  // bulk delete users
  @Post('deleteUsers')
  @UseGuards(AuthGuard)
  async deleteUsers(
    @Body('ids') ids: number[],
    @Res() res: Response,
  ): Promise<Response> {
    try {
      await this.userService.delete(ids);
      return res.status(200).json({ message: 'User Deleted' });
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

  // bulk status update
  @Post('updateStatusForUsers')
  @UseGuards(AuthGuard)
  async updateStatusForUsers(
    @Body('ids') ids: number[],
    @Body('status') status: string,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      await this.userService.updateStatusForUsers(ids, status);
      return res.status(200).json({ message: 'User Updated' });
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
  @Post('updateActivityForUsers')
  // @UseGuards(AuthGuard)
  async updateActivityForUsers(
    @Body('id') id: number,
    @Body('activity') activity: USER_STATUS,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      await this.userService.updateActivtyForUsers(id, activity);
      return res.status(200).json({ message: 'User"s activity Updated' });
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

  @Post('updateOrderOfUsers')
  async updateOrderOfUsers(
    @Body('usersObj') usersObj: User[],
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const orderuser = await this.userService.updateOrderOfUsers(usersObj);
      return res.status(200).json({ message: 'User Order updated', orderuser });
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

  @Post('solde')
  async getUsersolde(
    @Body('id') id: number,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const users_solde = await this.userService.getSolde(id);
      return res.status(200).json({ message: "User' solde", users_solde });
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

  // update user data
  @Put(':id')
  @UseGuards(AuthGuard)
  async update(
    @Param('id') id: number,
    @Body('user') user: UpdateUserDto,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      if (!user.password?.replace(/\s/g, '').length) {
        delete user.password;
      } else {
        user.password = hashSync(user.password, genSaltSync(10));
      }
      await this.userService.update(id, user);
      const updateUser = await this.userService.findOne(id);
      return res
        .status(200)
        .json({ message: 'User Updated', user: updateUser });
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

  // delete one user
  @Delete(':id')
  @UseGuards(AuthGuard)
  async delete(
    @Param('id') id: number,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      await this.userService.deleteOne(id);
      return res.status(200).json({ message: 'User Deleted' });
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

  @UseGuards(AuthGuard)
  @Delete('delete-restriction/:id')
  async deleteRestriction(
    @Param('id') id: number,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      await this.userService.deleteRestriction(id);
      return res.status(200).json({ message: 'Restriction Deleted' });
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
