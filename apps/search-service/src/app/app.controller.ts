import { Controller, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import {
  IndexListingsDto,
  ItemTransfer,
  SearchListingParams,
} from '@backend/dto';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly logger: Logger
  ) {}

  @MessagePattern('search.listings.v1')
  handleSearchListing(@Payload() data: SearchListingParams) {
    this.logger.log(
      `Получено событие [search.listings.v1] по query: ${data.query}`
    );
    return this.appService.searchListing(data.query, data.page, data.limit);
  }

  @EventPattern('listing.created.v1')
  handleListingCreated(@Payload() data: IndexListingsDto) {
    this.logger.log(`Получено событие [listing.created.v1] для ${data.id}`);
    return this.appService.indexListing(data);
  }

  @EventPattern('listing.updated.v1')
  handleListingUpdated(@Payload() data: IndexListingsDto) {
    this.logger.log(`Получено событие [listing.updated.v1] для ${data.id}`);
    return this.appService.indexListing(data);
  }

  @EventPattern('market.item-sold.v1')
  handleListingSold(@Payload() data: ItemTransfer) {
    this.logger.log(
      `Получено событие [listing.sold.v1] для ${data.listing.id}`
    );
    return this.appService.removeListing(data.listing.id);
  }

  @EventPattern('listing.deleted.v1')
  handleListingDeleted(@Payload() listingId: string) {
    this.logger.log(`Получено событие [listing.deleted.v1] для ${listingId}`);
    return this.appService.removeListing(listingId);
  }
}
