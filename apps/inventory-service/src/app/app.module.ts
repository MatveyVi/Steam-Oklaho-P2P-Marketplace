import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule, PrismaService } from '@backend/database';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MICROSERVICE_LIST } from '@backend/constants';

@Module({
  imports: [
    DatabaseModule,
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
