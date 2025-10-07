import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { LoginUserDto, RegisterUserDto } from '@backend/dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern('auth-login')
  async login(@Payload() dto: LoginUserDto) {
    return await this.appService.login(dto);
  }

  @MessagePattern('auth-register')
  async register(@Payload() dto: RegisterUserDto) {
    return await this.appService.register(dto);
  }
}
