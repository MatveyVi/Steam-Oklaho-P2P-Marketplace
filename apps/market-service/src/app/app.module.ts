import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MICROSERVICE_LIST } from '@backend/constants';
import { DatabaseModule } from '@backend/database';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    ClientsModule.registerAsync([
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
        name: MICROSERVICE_LIST.KAFKA_SERVICE,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              brokers: [configService.getOrThrow<string>('KAFKA_BROKER')],
            },
            consumer: {
              groupId: 'market-service',
            },
          },
        }),
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService, Logger],
})
export class AppModule {}
