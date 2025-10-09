import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import cookieParser from 'cookie-parser';
import { AllExceptionsFilter } from './filters/rpc-exception.filter';
import { validationPipeConfig } from './config/validation-pipe.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.use(cookieParser());
  app.useGlobalFilters(new AllExceptionsFilter());
  app.setGlobalPrefix(globalPrefix);
  app.useGlobalPipes(new ValidationPipe(validationPipeConfig));
  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(
    `🚀 GateWay Service is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
