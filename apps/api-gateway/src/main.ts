import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.use(cookieParser());
  app.setGlobalPrefix(globalPrefix);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // удаляем лишние поля из запроса
      forbidNonWhitelisted: true, // выбрасываем ошибку если есть лишние поля
      transform: true, // number -> string условно
    })
  );
  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(
    `🚀 GateWay Service is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
