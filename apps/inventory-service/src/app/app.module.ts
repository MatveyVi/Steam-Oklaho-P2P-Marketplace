import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from '@backend/database';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MICROSERVICE_LIST } from '@backend/constants';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        baseURL: configService.getOrThrow<string>('CATALOG_SERVICE_URL'),
      }),
    }),
    ClientsModule.registerAsync([
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
  providers: [AppService, Logger],
})
export class AppModule {}
