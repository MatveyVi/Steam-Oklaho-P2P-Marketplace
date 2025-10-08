import { registerAs } from '@nestjs/config';

export const jwtConfig = registerAs('jwt', () => ({
  access: {
    secret: process.env.JWT_ACCESS_SERCET,
    expiration: process.env.JWT_ACCESS_EXPIRATION,
  },
  refresh: {
    secret: process.env.JWT_REFRESH_SERCET,
    expiration: process.env.JWT_REFRESH_EXPIRATION,
  },
}));
