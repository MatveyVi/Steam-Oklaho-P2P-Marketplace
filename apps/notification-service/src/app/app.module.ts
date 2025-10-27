import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { HttpModule } from '@nestjs/axios';
import { MICROSERVICE_LIST } from '@backend/constants';
import { ResendMailer } from './resend/resend.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HttpModule.register({
      baseURL: 'http://localhost:3003/api',
    }),
    ClientsModule.register([
      {
        name: MICROSERVICE_LIST.USER_SERVICE,
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: 4005,
        },
      },
      {
        name: MICROSERVICE_LIST.PAYMENT_SERVICE,
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: 4007,
        },
      },
      {
        name: MICROSERVICE_LIST.CATALOG_SERVICE,
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: 4003,
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService, ResendMailer, Logger],
})
export class AppModule {}
