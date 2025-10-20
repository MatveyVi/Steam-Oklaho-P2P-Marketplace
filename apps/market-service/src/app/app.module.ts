import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MICROSERVICE_LIST } from '@backend/constants';
import { DatabaseModule } from '@backend/database';

@Module({
  imports: [
    DatabaseModule,
    ClientsModule.register([
      {
        name: MICROSERVICE_LIST.INVENTORY_SERVICE,
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: 4004,
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
    ]),
  ],
  controllers: [AppController],
  providers: [AppService, Logger],
})
export class AppModule {}
