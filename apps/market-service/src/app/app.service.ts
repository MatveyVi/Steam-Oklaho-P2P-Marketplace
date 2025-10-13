import { Inject, Injectable, Logger } from '@nestjs/common';
import { CreateListingDto, EditListingDto, PaginationDto } from '@backend/dto';
import { lastValueFrom } from 'rxjs';
import { MICROSERVICE_LIST } from '@backend/constants';
import { ClientProxy } from '@nestjs/microservices';
import {
  RpcBadRequestException,
  RpcForbiddenException,
} from '@backend/exceptions';
import { PrismaService } from '@backend/database';
import { Prisma } from '@prisma/client';

@Injectable()
export class AppService {
  constructor(
    private readonly logger: Logger,
    @Inject(MICROSERVICE_LIST.INVENTORY_SERVICE)
    private readonly inventoryClient: ClientProxy,
    private readonly prismaService: PrismaService
  ) {}

  async getAllListings(pagination: PaginationDto) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const orderBy = { createdAt: Prisma.SortOrder.desc };

    const [listings, total] = await Promise.all([
      this.prismaService.listing.findMany({
        where: {
          status: 'ACTIVE',
        },
        skip,
        take: limit,
        orderBy,
      }),
      this.prismaService.listing.count({
        where: { status: 'ACTIVE' },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: listings,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async createListing(sellerId: string, dto: CreateListingDto) {
    this.logger.log(`Запрос на выставление на продажу предмета ${dto.itemId}`);

    try {
      await lastValueFrom(
        this.inventoryClient.send('inventory.lock-item.v1', {
          userId: sellerId,
          itemId: dto.itemId,
        })
      );
      this.logger.log(`Предмет ${dto.itemId} успешно заблокирован в инвентаре`);
    } catch (error: any) {
      this.logger.error(`Не удалось заблокировать предмет: ${error.message}`);
      throw new RpcBadRequestException(
        `Не удалось выставить предмет на продажу: ${error.message}`
      );
    }
    return this.prismaService.listing.create({
      data: {
        itemId: dto.itemId,
        sellerId,
        price: dto.price,
        status: 'ACTIVE',
      },
    });
  }

  async editListing(sellerId: string, listingId: string, dto: EditListingDto) {
    this.logger.log(`Запрос на изменение предмета ${listingId}}`);
    const listing = await this.prismaService.listing.findUnique({
      where: {
        id: listingId,
      },
    });
    if (!listing) throw new RpcBadRequestException('Предмет не найден');

    if (listing.sellerId !== sellerId)
      throw new RpcForbiddenException('Вы не владеете этим предметом');

    return await this.prismaService.listing.update({
      where: {
        id: listingId,
      },
      data: {
        price: dto.price,
      },
    });
  }

  async deleteListing(sellerId: string, listingId: string) {
    this.logger.log(`Запрос на удаление предмета ${listingId}}`);

    const listing = await this.prismaService.listing.findUnique({
      where: {
        id: listingId,
      },
    });

    if (!listing) throw new RpcBadRequestException('Предмет не найден');

    if (listing.sellerId !== sellerId)
      throw new RpcForbiddenException('Вы не владеете этим предметом');

    try {
      await lastValueFrom(
        this.inventoryClient.send('inventory.unlock-item.v1', {
          userId: sellerId,
          itemId: listing.itemId,
        })
      );
      this.logger.log(
        `Предмет ${listing.itemId} успешно разблокирован в инвентаре`
      );
    } catch (error: any) {
      this.logger.error(`Не удалось разблокировать предмет: ${error.message}`);
      throw new RpcBadRequestException(
        `Не удалось снять предмет с продажу: ${error.message}`
      );
    }

    await this.prismaService.listing.delete({
      where: {
        id: listingId,
      },
    });
  }
}
