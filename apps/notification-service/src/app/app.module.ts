import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { HttpModule } from '@nestjs/axios';
import { MICROSERVICE_LIST } from '@backend/constants';
import { ResendMailer } from './resend/resend.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        baseURL: configService.getOrThrow<string>('CATALOG_SERVICE_URL'),
      }),
    }),
    ClientsModule.registerAsync([
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
        name: MICROSERVICE_LIST.CATALOG_SERVICE,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.getOrThrow<string>('CATALOG_SERVICE_HOST'),
            port: +configService.getOrThrow<number>('CATALOG_SERVICE_PORT'),
          },
        }),
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService, ResendMailer, Logger],
})
export class AppModule {}
