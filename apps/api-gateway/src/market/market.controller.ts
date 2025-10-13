import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Logger,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Auth } from '../app/decorators/auth.decorator';
import { GetCurrentUser } from '../app/decorators/get-current-user.decorator';
import { CreateListingDto, EditListingDto, PaginationDto } from '@backend/dto';
import { MICROSERVICE_LIST } from '@backend/constants';
import { ClientProxy } from '@nestjs/microservices';

@Controller('market')
export class MarketController {
  constructor(
    @Inject(MICROSERVICE_LIST.MARKET_SERVICE)
    private readonly marketClient: ClientProxy,
    private readonly logger: Logger
  ) {}

  @Get('listings')
  @Auth()
  async getAllListings(@Query() paginationDto: PaginationDto) {
    this.logger.log(`Получен запрос на получение всех листингов`);
    return this.marketClient.send('market.get-all-listings.v1', paginationDto);
  }

  @Get('listings/:listingId')
  @Auth()
  async getListingById(@Param('listingId') listingId: string) {
    this.logger.log(`Получен запрос на получение листинга ${listingId}`);
    return this.marketClient.send('market.get-listing-by-id.v1', listingId);
  }

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

  @Auth()
  @Delete('listings/:listingId')
  async deleteListing(
    @GetCurrentUser() userId: string,
    @Param('listingId') listingId: string
  ) {
    this.logger.log(`Получен запрос на удаление листинга ${listingId}`);
    return this.marketClient.send('market.delete-listing.v1', {
      userId,
      listingId,
    });
  }
}
