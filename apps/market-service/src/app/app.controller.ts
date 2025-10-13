import { Controller, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { CreateListingDto } from '@backend/dto';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly logger: Logger
  ) {}

  @MessagePattern('market.create-listing.v1')
  handleCreateListing(
    @Payload() data: { userId: string; dto: CreateListingDto }
  ) {
    this.logger.log(`Получен запрос на листинг предмета ${data.dto.itemId}`);
    return this.appService.createListing(data.userId, data.dto);
  }
}
