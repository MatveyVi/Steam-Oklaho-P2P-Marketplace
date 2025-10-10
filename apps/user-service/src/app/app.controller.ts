import { Controller, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { EventPattern, Payload } from '@nestjs/microservices';
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
}
