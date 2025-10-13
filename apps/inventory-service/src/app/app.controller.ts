import { Controller, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AddFakeItemDto } from '@backend/dto';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly logger: Logger
  ) {}

  @MessagePattern('inventory.add-fake-item.v1')
  async handleAddFakeItem(@Payload() dto: AddFakeItemDto) {
    return this.appService.addFakeItem(dto);
  }

  @MessagePattern('inventory.get-items-by-user-id.v1')
  async handleGetItemsById(@Payload() userId: string) {
    this.logger.log(`Получен запрос на инвентарь пользователя ${userId}`);
    return this.appService.getItemsById(userId);
  }

  @MessagePattern('inventory.lock-item.v1')
  async handleLockItem(@Payload() data: { userId: string; itemId: string }) {
    await this.appService.lockItem(data);
    return { success: true };
  }

  @MessagePattern('inventory.unlock-item.v1')
  async handleUnlockItem(@Payload() data: { userId: string; itemId: string }) {
    await this.appService.unlockItem(data);
    return { success: true };
  }
}
