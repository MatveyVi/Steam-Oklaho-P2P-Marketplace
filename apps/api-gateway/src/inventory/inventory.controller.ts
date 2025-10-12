import { Body, Controller, Inject, Post } from '@nestjs/common';
import { AddFakeItemDto } from '@backend/dto';
import { MICROSERVICE_LIST } from '@backend/constants';
import { ClientProxy } from '@nestjs/microservices';

@Controller('inventory')
export class InventoryController {
  constructor(
    @Inject(MICROSERVICE_LIST.INVENTORY_SERVICE)
    private readonly inventoryClient: ClientProxy
  ) {}

  @Post('test/add-item')
  addFakeItem(@Body() dto: AddFakeItemDto) {
    return this.inventoryClient.send('inventory.add-fake-item.v1', dto);
  }
}
