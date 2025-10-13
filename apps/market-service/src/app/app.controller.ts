import { Controller, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { CreateListingDto, EditListingDto } from '@backend/dto';
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

  @MessagePattern('market.edit-listing.v1')
  handleEditListing(
    @Payload() data: { userId: string; listingId: string; dto: EditListingDto }
  ) {
    this.logger.log(`Получен запрос на изменение предмета ${data.listingId}`);
    return this.appService.editListing(data.userId, data.listingId, data.dto);
  }

  @MessagePattern('market.delete-listing.v1')
  handleDeteteListing(@Payload() data: { userId: string; listingId: string }) {
    this.logger.log(`Получен запрос на удаление предмета ${data.listingId}`);
    return this.appService.deleteListing(data.userId, data.listingId);
  }
}
