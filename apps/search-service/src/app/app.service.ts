import { MICROSERVICE_LIST } from '@backend/constants';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ClientProxy } from '@nestjs/microservices';
import {
  IndexListingsDto,
  ListingResponseDto,
  ListingsResponseDto,
  MyProfileResponseDto,
} from '@backend/dto';
import { lastValueFrom } from 'rxjs';
import { BaseItem } from '@prisma/client';
import { plainToInstance } from 'class-transformer';

const LISTINGS_INDEX = 'listings';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    private readonly esService: ElasticsearchService,
    private readonly logger: Logger,
    @Inject(MICROSERVICE_LIST.USER_SERVICE)
    private readonly userClient: ClientProxy,
    @Inject(MICROSERVICE_LIST.CATALOG_SERVICE)
    private readonly catalogClient: ClientProxy
  ) {}

  async onModuleInit() {
    await this.createIndexIfNotExists();
  }

  private async createIndexIfNotExists() {
    const checkIndex = await this.esService.indices.exists({
      index: LISTINGS_INDEX,
    });
    if (checkIndex) return;
    this.logger.log(`Индекс ${LISTINGS_INDEX} не найден, создаем...`);
    await this.esService.indices.create({ index: LISTINGS_INDEX });
  }

  async indexListing(data: IndexListingsDto) {
    if (data.status === 'SOLD' || data.status === 'DELETED') {
      return this.removeListing(data.id);
    }

    this.logger.log(`Индексация листинга ${data.id}...`);
    try {
      const [sellerProfile, baseItem] = await Promise.all([
        lastValueFrom(
          this.userClient.send<MyProfileResponseDto>(
            'user.get-profile-by-id.v1',
            data.sellerId
          )
        ),
        lastValueFrom(
          this.catalogClient.send<BaseItem>(
            'catalog.find-by-external-id.v1',
            data.externalId
          )
        ),
      ]);
      const document: Omit<IndexListingsDto, 'externalId'> = {
        id: data.id,
        itemId: data.itemId,
        sellerId: data.sellerId,
        price: data.price,
        status: data.status,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        nickname: sellerProfile.nickname,
        name: baseItem.name,
        imageUrl: baseItem.imageUrl,
      };

      await this.esService.index({
        index: LISTINGS_INDEX,
        id: data.id,
        document,
      });
      this.logger.log(`Листинг ${data.id} успешно проиндексирован.`);
    } catch (error) {
      this.logger.error(`Ошибка индексации ${data.id}`);
    }
  }

  async removeListing(listingId: string) {
    this.logger.log(`Удаление листинга ${listingId} из индекса`);
    try {
      await this.esService.delete({
        index: LISTINGS_INDEX,
        id: listingId,
      });
    } catch (error) {
      this.logger.error(
        `Не удалось удалить ${listingId}, возможно он уже не существует`
      );
    }
  }
  async searchListing(
    query: string,
    page: number,
    limit: number
  ): Promise<ListingsResponseDto> {
    this.logger.log(`Поиск по запросу: ${query}`);
    const { hits } = await this.esService.search({
      index: LISTINGS_INDEX,
      from: (page - 1) * limit,
      size: limit,
      query: {
        match: {
          name: {
            query,
            fuzziness: 'AUTO',
          },
        },
      },
    });
    const totalValue =
      typeof hits.total === 'number' ? hits.total : hits.total?.value;
    const total = totalValue ?? 0;
    const totalPages = Math.ceil(total / limit);

    const items = hits.hits.map((hit) => hit._source);

    const data = plainToInstance(ListingResponseDto, items, {
      excludeExtraneousValues: true,
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }
}
