import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule as NestJwtModule } from '@nestjs/jwt';
import { jwtConfig } from './config/jwt.config';
import { JwtService } from './jwt.service';

@Module({
  imports: [NestJwtModule.register({}), ConfigModule.forFeature(jwtConfig)],
  providers: [JwtService],
  exports: [JwtService],
})
export class BackendJwtModule {}
