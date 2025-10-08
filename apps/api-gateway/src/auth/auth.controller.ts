import { Body, Controller, Inject, Post } from '@nestjs/common';
import { LoginUserDto, RegisterUserDto } from '@backend/dto';
import { MICROSERVICE_LIST } from '@backend/constants';
import { ClientProxy } from '@nestjs/microservices';

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
}
