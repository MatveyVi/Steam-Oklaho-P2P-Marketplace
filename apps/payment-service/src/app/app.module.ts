import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MICROSERVICE_LIST } from '@backend/constants';
import { DatabaseModule } from '@backend/database';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WebhookController } from '../webhook/webhook.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    ClientsModule.registerAsync([
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
    ]),
  ],
  controllers: [AppController, WebhookController],
  providers: [AppService, Logger],
})
export class AppModule {}
