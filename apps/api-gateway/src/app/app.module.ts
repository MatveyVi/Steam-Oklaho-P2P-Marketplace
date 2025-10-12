import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MICROSERVICE_LIST } from '@backend/constants';
import { AuthController } from '../auth/auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { UserController } from '../users/user.controller';
import { HttpModule } from '@nestjs/axios';
import { CatalogController } from '../catalog/catalog.controller';
import { InventoryController } from '../inventory/inventory.controller';
import { InventoryService } from '../inventory/inventory.service';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    HttpModule.register({
      baseURL: 'http://localhost:3003/api',
    }),
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
        name: MICROSERVICE_LIST.USER_SERVICE,
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: 4005,
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
      {
        name: MICROSERVICE_LIST.INVENTORY_SERVICE,
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: 4004,
        },
      },
    ]),
  ],
  controllers: [
    AppController,
    AuthController,
    UserController,
    CatalogController,
    InventoryController,
  ],
  providers: [
    AppService,
    InventoryService,
    JwtStrategy,
    JwtRefreshStrategy,
    Logger,
  ],
})
export class AppModule {}
