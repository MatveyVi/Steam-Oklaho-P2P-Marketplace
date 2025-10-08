import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from '@backend/database';
import { BackendJwtModule } from '@backend/jwt';

@Module({
  imports: [DatabaseModule, BackendJwtModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
