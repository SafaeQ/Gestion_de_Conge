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
import { ToolsService } from './tools.service';
import { GlobalGuard } from 'guards/global.guard';
import { Tool } from 'entities/tools';

@Controller('api/tools')
export class ToolsController {
  constructor(private readonly toolsService: ToolsService) {}

  @Get()
  @UseGuards(GlobalGuard)
  findAllTools(): Promise<Tool[]> {
    try {
      return this.toolsService.findAllTools();
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

  @Get('entity/:entity')
  @UseGuards(GlobalGuard)
  findAllToolsByEntity(@Param('entity') entity: number): Promise<Tool[]> {
    try {
      return this.toolsService.findAllToolsByEntity(entity);
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

  // find one tool
  @Get(':id')
  @UseGuards(GlobalGuard)
  findOneTool(@Param('id') id: number): Promise<Tool> {
    try {
      return this.toolsService.findOne(id);
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
    @Body('tool') tool: Tool,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      await this.toolsService.insert(tool);
      return res.status(200).json({ message: 'Tool Created' });
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
  @Post('delete-tools')
  @UseGuards(GlobalGuard)
  async deleteTools(
    @Body('ids') ids: number[],
    @Res() res: Response,
  ): Promise<Response> {
    try {
      await this.toolsService.delete(ids);
      return res.status(200).json({ message: 'Tools Deleted' });
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
      await this.toolsService.deleteOne(id);
      return res.status(200).json({ message: 'Tool Deleted' });
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
    @Body('tool') tool: Tool,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      await this.toolsService.update(id, tool);
      return res.status(200).json({ message: 'Tool Updated' });
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
