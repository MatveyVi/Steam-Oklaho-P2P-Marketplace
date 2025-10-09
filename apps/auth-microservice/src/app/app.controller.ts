import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { LoginUserDto, RegisterUserDto } from '@backend/dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern('auth.register.v1')
  async register(@Payload() dto: RegisterUserDto) {
    return await this.appService.register(dto);
  }

  @MessagePattern('auth.login.v1')
  async login(@Payload() dto: LoginUserDto) {
    return await this.appService.login(dto);
  }

  @MessagePattern('auth.refresh.v1')
  async refresh(@Payload() userId: string) {
    return await this.appService.refreshTokens(userId);
  }
}
