import { ClassSerializerInterceptor, Logger } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: [configService.getOrThrow('KAFKA_BROKER')],
      },
      consumer: {
        groupId: 'search-service',
      },
    },
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: configService.getOrThrow('SEARCH_SERVICE_HOST'),
      port: +configService.getOrThrow('SEARCH_SERVICE_PORT'),
    },
  });

  app.startAllMicroservices();
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const port = configService.getOrThrow('SEARCH_SERVICE_HTTP_PORT');

  await app.listen(port);
  Logger.log(
    `🚀 Search Service is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
