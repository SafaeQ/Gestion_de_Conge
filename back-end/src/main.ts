import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { join } from 'path';
import { json, urlencoded } from 'express';
import compression from 'compression';
async function bootstrap() {
  const origins = [
    'https://vozana.ticketings.org',
    'https://adsglory1.ticketings.org',
    'https://adsglory2.ticketings.org',
    'https://ltm.ticketings.org',
    'https://pinleads.ticketings.org',
    'https://web7.ticketings.org',
    'https://admin.ticketings.org',
    'https://avalon.ticketings.org',
    'https://support.ticketings.org',
    'https://ileadtraffic.ticketings.org',
    'https://mailshot.ticketings.org',
    'https://hr.adsglory.net',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://65.109.179.27:3000',
    'http://65.109.179.27:3001',
    'http://65.109.179.27:3002',
  ];
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({
    origin: origins,
    credentials: true,
  });
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  app.useStaticAssets(join(__dirname, '..', 'images'));
  app.use(helmet());
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe());
  app.use(compression());
  await app.listen(4001);
}
bootstrap();
