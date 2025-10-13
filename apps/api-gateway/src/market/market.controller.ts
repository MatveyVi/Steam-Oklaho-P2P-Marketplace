import { Body, Controller, Inject, Logger, Post } from '@nestjs/common';
import { Auth } from '../app/decorators/auth.decorator';
import { GetCurrentUser } from '../app/decorators/get-current-user.decorator';
import { CreateListingDto } from '@backend/dto';
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
    this.logger.log(`Получени запрос на выставление предмета ${dto.itemId}`);
    return this.marketClient.send('market.create-listing.v1', { userId, dto });
  }
}
