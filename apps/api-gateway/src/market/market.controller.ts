import {
  Body,
  Controller,
  Inject,
  Logger,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Auth } from '../app/decorators/auth.decorator';
import { GetCurrentUser } from '../app/decorators/get-current-user.decorator';
import { CreateListingDto, EditListingDto } from '@backend/dto';
import { MICROSERVICE_LIST } from '@backend/constants';
import { ClientProxy } from '@nestjs/microservices';

@Controller('market')
export class MarketController {
  constructor(
    @Inject(MICROSERVICE_LIST.MARKET_SERVICE)
    private readonly marketClient: ClientProxy,
    private readonly logger: Logger
  ) {}

  @Auth()
  @Post('listings')
  async createListing(
    @GetCurrentUser() userId: string,
    @Body() dto: CreateListingDto
  ) {
    this.logger.log(`Получен запрос на выставление листинга ${dto.itemId}`);
    return this.marketClient.send('market.create-listing.v1', { userId, dto });
  }

  @Auth()
  @Patch('listings/:listingId')
  async editListing(
    @GetCurrentUser() userId: string,
    @Param('listingId') listingId: string,
    @Body() dto: EditListingDto
  ) {
    this.logger.log(`Получен запрос на изменение листинга ${listingId}`);
    return this.marketClient.send('market.edit-listing.v1', {
      userId,
      listingId,
      dto,
    });
  }
}
