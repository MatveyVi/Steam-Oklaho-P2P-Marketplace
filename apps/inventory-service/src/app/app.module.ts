import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from '@backend/database';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MICROSERVICE_LIST } from '@backend/constants';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    DatabaseModule,
    HttpModule.register({
      baseURL: 'http://localhost:3003/api',
    }),
    ClientsModule.register([
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
  providers: [AppService, Logger],
})
export class AppModule {}
