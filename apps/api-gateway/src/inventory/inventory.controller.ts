import { Body, Controller, Get, Inject, Logger, Post } from '@nestjs/common';
import { AddFakeItemDto } from '@backend/dto';
import { MICROSERVICE_LIST } from '@backend/constants';
import { ClientProxy } from '@nestjs/microservices';
import { Auth } from '../app/decorators/auth.decorator';
import { GetCurrentUser } from '../app/decorators/get-current-user.decorator';
import { InventoryService } from './inventory.service';

@Controller('inventory')
export class InventoryController {
  constructor(
    @Inject(MICROSERVICE_LIST.INVENTORY_SERVICE)
    private readonly inventoryClient: ClientProxy,
    private readonly logger: Logger,
    private readonly inventoryService: InventoryService
  ) {}

  @Post('test/add-item')
  addFakeItem(@Body() dto: AddFakeItemDto) {
    return this.inventoryClient.send('inventory.add-fake-item.v1', dto);
  }

  @Get('me')
  @Auth()
  getUserItems(@GetCurrentUser() userId: string) {
    this.logger.log(`Запрос на получение инвентаря от ${userId}`);
    return this.inventoryService.getUserItems(userId);
  }
}
