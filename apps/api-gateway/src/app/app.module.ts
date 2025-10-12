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

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    HttpModule.register({
      baseURL: 'http://localhost:4003/api',
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
          port: 4002,
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
    ]),
  ],
  controllers: [
    AppController,
    AuthController,
    UserController,
    CatalogController,
  ],
  providers: [AppService, JwtStrategy, JwtRefreshStrategy, Logger],
})
export class AppModule {}
