import {
  ClassSerializerInterceptor,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app/app.module';
import cookieParser from 'cookie-parser';
import { AllExceptionsFilter } from './filters/rpc-exception.filter';
import { validationPipeConfig } from './config/validation-pipe.config';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const globalPrefix = 'api';

  app.use(cookieParser());
  app.useGlobalFilters(new AllExceptionsFilter());
  app.setGlobalPrefix(globalPrefix);
  app.useGlobalPipes(new ValidationPipe(validationPipeConfig));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const port = configService.getOrThrow('API_GATEWAY_PORT');

  await app.listen(port);
  Logger.log(
    `🚀 GateWay Service is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
