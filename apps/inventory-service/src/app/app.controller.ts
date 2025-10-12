import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AddFakeItemDto } from '@backend/dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern('inventory.add-fake-item.v1')
  handleAddFakeItem(@Payload() dto: AddFakeItemDto) {
    return this.appService.addFakeItem(dto);
  }
}
