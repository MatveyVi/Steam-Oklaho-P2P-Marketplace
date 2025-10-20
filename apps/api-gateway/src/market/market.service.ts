import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { MICROSERVICE_LIST } from '@backend/constants';
import { ClientProxy } from '@nestjs/microservices';
import { BaseItem, Listing, Profile } from '@prisma/client';
import { lastValueFrom, map } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import {
  GetAllListings,
  ListingResponseDto,
  ListingsResponseDto,
  PaginationDto,
} from '@backend/dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class MarketService {
  constructor(
    @Inject(MICROSERVICE_LIST.MARKET_SERVICE)
    private readonly marketClient: ClientProxy,
    @Inject(MICROSERVICE_LIST.USER_SERVICE)
    private readonly userClient: ClientProxy,
    private readonly httpService: HttpService
  ) {}

  async getListingById(listingId: string) {
    const listing: Listing | null = await lastValueFrom(
      this.marketClient.send('market.get-listing-by-id.v1', listingId)
    );
    if (!listing) throw new BadRequestException('Листинга не существует');
    const [user, baseItemResponse] = await Promise.all([
      lastValueFrom(
        this.userClient.send('user.get-profile-by-id.v1', listing.sellerId)
      ),
      lastValueFrom(this.httpService.get(`/items/${listing.externalId}`)),
    ]);

    const baseItem: BaseItem = baseItemResponse.data;

    return plainToInstance(
      ListingResponseDto,
      {
        ...user,
        ...baseItem,
        ...listing,
      },
      {
        excludeExtraneousValues: true,
      }
    );
  }

  async getAllListings(
    paginationDto: PaginationDto
  ): Promise<ListingsResponseDto> {
    const listingsResponse: GetAllListings = await lastValueFrom(
      this.marketClient.send('market.get-all-listings.v1', paginationDto)
    );
    const listings = listingsResponse.data;
    const meta = listingsResponse.meta;

    const sellerIds = [...new Set(listings.map((l) => l.sellerId))];
    const baseItemsIds = [...new Set(listings.map((l) => l.externalId))];

    const [sellers, items] = await Promise.all([
      lastValueFrom(
        this.userClient.send<Profile[]>(
          'user.get-profiles-by-ids.v1',
          sellerIds
        )
      ),
      lastValueFrom(
        this.httpService
          .get<BaseItem[]>(`/items/by-ids`, {
            params: { ids: baseItemsIds.join(',') },
          })
          .pipe(map((res) => res.data))
      ),
    ]);
    const data: ListingResponseDto[] = listings.map((listing) => {
      const seller = sellers.find((s) => s.userId === listing.sellerId);
      const item = items.find((i) => i.externalId === listing.externalId);
      return plainToInstance(
        ListingResponseDto,
        {
          ...seller,
          ...item,
          ...listing,
        },
        { excludeExtraneousValues: true }
      );
    });
    return {
      data,
      meta,
    };
  }

  async getUserListings(
    userId: string,
    paginationDto: PaginationDto
  ): Promise<ListingsResponseDto> {
    await lastValueFrom(
      this.userClient.send('user.get-profile-by-id.v1', userId)
    );
    const listingsResponse: GetAllListings = await lastValueFrom(
      this.marketClient.send('market.get-user-listings.v1', {
        userId,
        paginationDto,
      })
    );
    const listings = listingsResponse.data;
    const meta = listingsResponse.meta;

    const sellerIds = [...new Set(listings.map((l) => l.sellerId))];
    const baseItemsIds = [...new Set(listings.map((l) => l.externalId))];

    const [sellers, items] = await Promise.all([
      lastValueFrom(
        this.userClient.send<Profile[]>(
          'user.get-profiles-by-ids.v1',
          sellerIds
        )
      ),
      lastValueFrom(
        this.httpService
          .get<BaseItem[]>(`/items/by-ids`, {
            params: { ids: baseItemsIds.join(',') },
          })
          .pipe(map((res) => res.data))
      ),
    ]);
    const data: ListingResponseDto[] = listings.map((listing) => {
      const seller = sellers.find((s) => s.userId === listing.sellerId);
      const item = items.find((i) => i.externalId === listing.externalId);
      return plainToInstance(
        ListingResponseDto,
        {
          ...seller,
          ...item,
          ...listing,
        },
        { excludeExtraneousValues: true }
      );
    });
    return {
      data,
      meta,
    };
  }
}
