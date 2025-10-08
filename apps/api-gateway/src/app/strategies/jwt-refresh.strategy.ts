import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { cookieExtractor } from './cookie-extractor';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh'
) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: cookieExtractor,
      secretOrKey: configService.getOrThrow<string>('JWT_REFRESH_SERCET'),
      ignoreExpiration: false,
    });
  }

  override async validate(payload: { sub: string }) {
    if (!payload.sub)
      throw new UnauthorizedException('Невалидный Refresh Token');
    return { id: payload.sub };
  }
}
