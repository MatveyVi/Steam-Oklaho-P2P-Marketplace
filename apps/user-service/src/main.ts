import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: ['localhost:29092'],
      },
      consumer: {
        groupId: 'user-consumer',
      },
    },
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: 'localhost',
      port: 4005,
    },
  });

  await app.startAllMicroservices();

  const port = process.env.PORT || 3005;
  await app.listen(port);

  Logger.log(`🚀 User Service is listening on TCP port 4005`);
}

bootstrap();
