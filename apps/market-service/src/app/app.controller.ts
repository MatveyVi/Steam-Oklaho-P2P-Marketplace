import { Controller, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { CreateListingDto, EditListingDto, PaginationDto } from '@backend/dto';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly logger: Logger
  ) {}

  @MessagePattern('market.get-all-listings.v1')
  handleGetListings(@Payload() pagination: PaginationDto) {
    this.logger.log(
      `Получен запрос на получение листингов, страница: ${pagination.page}, лимит: ${pagination.limit}`
    );
    return this.appService.getAllListings(pagination);
  }

  @MessagePattern('market.get-listing-by-id.v1')
  handleGetListingById(@Payload() listingId: string) {
    this.logger.log(`Получен запрос на получение листинга ${listingId}`);
    return this.appService.getListingById(listingId);
  }

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

  @MessagePattern('market.buy-listing.v1')
  handleBuyItem(@Payload() data: { buyerId: string; listingId: string }) {
    return this.appService.buyItem(data.buyerId, data.listingId);
  }
}
