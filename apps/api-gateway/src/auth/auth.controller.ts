import { Body, Controller, Inject, Post, Res } from '@nestjs/common';
import { LoginUserDto, RegisterUserDto } from '@backend/dto';
import { MICROSERVICE_LIST } from '@backend/constants';
import { ClientProxy } from '@nestjs/microservices';
import { Refresh } from '../app/decorators/refresh.decorator';
import { GetCurrentUser } from '../app/decorators/get-current-user.decorator';
import { type Response } from 'express';
import { lastValueFrom } from 'rxjs';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(MICROSERVICE_LIST.AUTH_SERVICE)
    private readonly authClient: ClientProxy
  ) {}
  @Post('register')
  async register(@Body() dto: RegisterUserDto) {
    return await this.authClient.send('auth.register.v1', dto);
  }

  @Post('login')
  async login(@Body() dto: LoginUserDto) {
    return await this.authClient.send('auth.login.v1', dto);
  }

  @Post('refresh')
  @Refresh()
  async refresh(
    @GetCurrentUser() userId: string,
    @Res({ passthrough: true }) res: Response
  ) {
    const tokensObservable = this.authClient.send<{
      accessToken: string;
      refreshToken: string;
    }>('auth.refresh.v1', userId);

    const tokens = await lastValueFrom(tokensObservable);

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      accessToken: tokens.accessToken,
    };
  }
}
