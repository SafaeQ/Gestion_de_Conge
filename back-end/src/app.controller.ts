import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { GlobalGuard } from 'guards/global.guard';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('download/:filename')
  @UseGuards(GlobalGuard)
  download(@Param('filename') filename: string, @Res() res: Response): void {
    res.download(`./files/${filename}`);
  }
}
