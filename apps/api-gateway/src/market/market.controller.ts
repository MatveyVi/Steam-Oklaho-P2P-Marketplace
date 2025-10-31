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
import {
  CreateListingDto,
  EditListingDto,
  GetListingsQueryDto,
  PaginationDto,
  SearchListingParams,
} from '@backend/dto';
import { MICROSERVICE_LIST } from '@backend/constants';
import { ClientProxy } from '@nestjs/microservices';
import { MarketService } from './market.service';

@Controller('market')
export class MarketController {
  constructor(
    @Inject(MICROSERVICE_LIST.MARKET_SERVICE)
    private readonly marketClient: ClientProxy,
    @Inject(MICROSERVICE_LIST.SEARCH_SERVICE)
    private readonly searchClient: ClientProxy,
    private readonly logger: Logger,
    private readonly marketService: MarketService
  ) {}

  @Auth()
  @Get('listings')
  async getAllListings(@Query() queryDto: GetListingsQueryDto) {
    const { search, ...paginationDto } = queryDto;
    if (search) {
      this.logger.log(`Получен запрос на получение листингов по query`);
      const data = new SearchListingParams(
        search,
        paginationDto.page,
        paginationDto.limit
      );
      return this.searchClient.send('search.listings.v1', data);
    }
    this.logger.log(`Получен запрос на получение всех листингов`);
    return this.marketService.getAllListings(paginationDto);
  }

  @Auth()
  @Get('listings/stall/me')
  async getMyListings(
    @GetCurrentUser() userId: string,
    @Query() paginationDto: PaginationDto
  ) {
    this.logger.log(`Запрос на получение своих листингов`);
    return this.marketService.getUserListings(userId, paginationDto);
  }

  @Auth()
  @Get('listings/stall/:userId')
  async getUserListings(
    @Param('userId') userId: string,
    @Query() paginationDto: PaginationDto
  ) {
    this.logger.log(`Запрос на получение своих листингов`);
    return this.marketService.getUserListings(userId, paginationDto);
  }

  @Get('listings/:listingId')
  @Auth()
  async getListingById(@Param('listingId') listingId: string) {
    this.logger.log(`Получен запрос на получение листинга ${listingId}`);
    return this.marketService.getListingById(listingId);
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

  // ---- ПОКУПКА АЙТЕМА ----

  @Auth()
  @Post('listings/:listingId/buy')
  async buyItem(
    @GetCurrentUser() buyerId: string,
    @Param('listingId') listingId: string
  ) {
    this.logger.log(
      `Получен запрос на покупку листинга ${listingId} от ${buyerId}`
    );
    return this.marketClient.send('market.buy-listing.v1', {
      buyerId,
      listingId,
    });
  }
}
