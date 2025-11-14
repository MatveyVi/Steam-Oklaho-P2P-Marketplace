import { ClassSerializerInterceptor, Logger } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const host = configService.getOrThrow('CATALOG_SERVICE_HOST');

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: host,
      port: +configService.getOrThrow('CATALOG_SERVICE_PORT'),
    },
  });

  await app.startAllMicroservices();
  const globalPrefix = 'api';
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.setGlobalPrefix(globalPrefix);

  const port = configService.getOrThrow('CATALOG_SERVICE_HTTP_PORT');

  await app.listen(port, host);
  Logger.log(
    `🚀 Catalog Service is running on: http://${host}:${port}/${globalPrefix}`
  );
}

bootstrap();
