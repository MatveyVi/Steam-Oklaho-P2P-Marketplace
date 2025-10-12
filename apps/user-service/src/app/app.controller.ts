import { Controller, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { UserRegisteredEvent } from '@backend/dto';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}

  @EventPattern('user.registered.v1')
  async handleUserRegistered(@Payload() data: UserRegisteredEvent) {
    this.logger.log(`Получена регистрация нового пользователя: ${data.email}`);
    return this.appService.createProfile(data);
  }

  @MessagePattern('user.get-profile-by-id.v1')
  async handleGetProfileById(@Payload() userId: string) {
    this.logger.log(`Получена запрос на профиль пользователя: ${userId}`);
    return this.appService.findProfileById(userId);
  }

  @MessagePattern('user.get-profile-by-nickname.v1')
  async handleGetProfileByNickname(@Payload() nickname: string) {
    this.logger.log(`Получена запрос на профиль пользователя: ${nickname}`);
    return this.appService.findProfileByNickname(nickname);
  }
}
