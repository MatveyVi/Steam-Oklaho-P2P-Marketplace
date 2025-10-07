import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MICROSERVICE_LIST } from '@backend/constants';
import { AuthController } from '../auth/auth.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: MICROSERVICE_LIST.AUTH_SERVICE,
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: 4001,
        },
      },
      {
        name: MICROSERVICE_LIST.KAFKA_SERVICE,
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: ['localhost:29092'],
          },
        },
      },
    ]),
  ],
  controllers: [AppController, AuthController],
  providers: [AppService],
})
export class AppModule {}
