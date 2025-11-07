import { Logger, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MICROSERVICE_LIST } from '@backend/constants';
import { AuthController } from '../auth/auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PassportModule,

    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        baseURL: configService.getOrThrow<string>('CATALOG_SERVICE_URL'),
      }),
    }),

    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: async () =>
          await redisStore({
            url: configService.getOrThrow<string>('REDIS_URL'),
            ttl: 300,
          }),
      }),
      isGlobal: true,
    }),

    ClientsModule.registerAsync([
      {
        name: MICROSERVICE_LIST.AUTH_SERVICE,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.getOrThrow<string>('AUTH_SERVICE_HOST'),
            port: +configService.getOrThrow<number>('AUTH_SERVICE_PORT'),
          },
        }),
      },
      {
        name: MICROSERVICE_LIST.USER_SERVICE,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.getOrThrow<string>('USER_SERVICE_HOST'),
            port: +configService.getOrThrow<number>('USER_SERVICE_PORT'),
          },
        }),
      },
      {
        name: MICROSERVICE_LIST.KAFKA_SERVICE,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              brokers: [configService.getOrThrow<string>('KAFKA_BROKER')],
            },
          },
        }),
      },
      {
        name: MICROSERVICE_LIST.INVENTORY_SERVICE,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.getOrThrow<string>('INVENTORY_SERVICE_HOST'),
            port: +configService.getOrThrow<number>('INVENTORY_SERVICE_PORT'),
          },
        }),
      },
      {
        name: MICROSERVICE_LIST.MARKET_SERVICE,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.getOrThrow<string>('MARKET_SERVICE_HOST'),
            port: +configService.getOrThrow<number>('MARKET_SERVICE_PORT'),
          },
        }),
      },
      {
        name: MICROSERVICE_LIST.PAYMENT_SERVICE,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.getOrThrow<string>('PAYMENT_SERVICE_HOST'),
            port: +configService.getOrThrow<number>('PAYMENT_SERVICE_PORT'),
          },
        }),
      },
      {
        name: MICROSERVICE_LIST.SEARCH_SERVICE,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.getOrThrow<string>('SEARCH_SERVICE_HOST'),
            port: +configService.getOrThrow<number>('SEARCH_SERVICE_PORT'),
          },
        }),
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
