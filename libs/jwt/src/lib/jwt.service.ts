import { Inject, Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { jwtConfig } from './config/jwt.config';
import { type ConfigType } from '@nestjs/config';

@Injectable()
export class JwtService {
  constructor(
    private readonly nestJwtService: NestJwtService,
    @Inject(jwtConfig.KEY) private readonly config: ConfigType<typeof jwtConfig>
  ) {}

  async generateAccessToken(payload: { sub: string }): Promise<String> {
    return this.nestJwtService.signAsync(payload, {
      secret: this.config.access.secret,
      expiresIn: this.config.access.expiration,
    });
  }

  async generateRefreshToken(payload: { sub: string }): Promise<String> {
    return this.nestJwtService.signAsync(payload, {
      secret: this.config.refresh.secret,
      expiresIn: this.config.refresh.expiration,
    });
  }
}
