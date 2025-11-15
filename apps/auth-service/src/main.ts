import { ClassSerializerInterceptor, Logger } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const host = configService.getOrThrow('AUTH_SERVICE_HOST');
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: host,
      port: +configService.getOrThrow('AUTH_SERVICE_PORT'),
    },
  });
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  await app.startAllMicroservices();

  const port = configService.getOrThrow('AUTH_SERVICE_HTTP_PORT');
  await app.listen(port, host);

  Logger.log(
    `🚀 Auth Service is running on: http://${host}:${port}/${globalPrefix}`
  );
}

bootstrap();
