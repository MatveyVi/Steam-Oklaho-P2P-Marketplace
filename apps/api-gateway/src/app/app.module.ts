import { Logger, Module } from '@nestjs/common';
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
import { MarketController } from '../market/market.controller';
import { MarketService } from '../market/market.service';
import { PaymentController } from '../payment/payment.controller';

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
      {
        name: MICROSERVICE_LIST.MARKET_SERVICE,
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: 4006,
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
        name: MICROSERVICE_LIST.SEARCH_SERVICE,
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: 4009,
        },
      },
    ]),
  ],
  controllers: [
    AuthController,
    UserController,
    CatalogController,
    InventoryController,
    MarketController,
    PaymentController,
  ],
  providers: [
    InventoryService,
    MarketService,
    JwtStrategy,
    JwtRefreshStrategy,
    Logger,
  ],
})
export class AppModule {}
