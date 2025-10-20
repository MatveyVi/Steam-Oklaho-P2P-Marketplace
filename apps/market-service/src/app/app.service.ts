import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  CreateListingDto,
  EditListingDto,
  GetAllListings,
  PaginationDto,
} from '@backend/dto';
import { lastValueFrom } from 'rxjs';
import { MICROSERVICE_LIST } from '@backend/constants';
import { ClientProxy } from '@nestjs/microservices';
import {
  RpcBadRequestException,
  RpcConflictException,
  RpcForbiddenException,
} from '@backend/exceptions';
import { PrismaService } from '@backend/database';
import { Listing, Prisma } from '@prisma/client';

@Injectable()
export class AppService {
  constructor(
    private readonly logger: Logger,
    @Inject(MICROSERVICE_LIST.INVENTORY_SERVICE)
    private readonly inventoryClient: ClientProxy,
    @Inject(MICROSERVICE_LIST.PAYMENT_SERVICE)
    private readonly paymentClient: ClientProxy,
    private readonly prismaService: PrismaService
  ) {}

  async getAllListings(pagination: PaginationDto): Promise<GetAllListings> {
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

  async getListingById(listingId: string): Promise<Listing | null> {
    return this.prismaService.listing.findUnique({
      where: {
        id: listingId,
      },
    });
  }

  async createListing(
    sellerId: string,
    dto: CreateListingDto
  ): Promise<Listing> {
    this.logger.log(`Запрос на выставление на продажу предмета ${dto.itemId}`);

    try {
      const externalId = await lastValueFrom(
        this.inventoryClient.send('inventory.lock-item.v1', {
          userId: sellerId,
          itemId: dto.itemId,
        })
      );
      return this.prismaService.listing.create({
        data: {
          itemId: dto.itemId,
          externalId,
          sellerId,
          price: dto.price,
          status: 'ACTIVE',
        },
      });
    } catch (error: any) {
      this.logger.error(`Не удалось заблокировать предмет: ${error.message}`);
      throw new RpcBadRequestException(
        `Не удалось выставить предмет на продажу: ${error.message}`
      );
    }
  }

  async editListing(
    sellerId: string,
    listingId: string,
    dto: EditListingDto
  ): Promise<Listing> {
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

  async deleteListing(sellerId: string, listingId: string): Promise<void> {
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

  async buyItem(buyerId: string, listingId: string) {
    this.logger.log(`Начало транзакции покупки предмета`);

    const listing = await this.prismaService.listing.findUnique({
      where: { id: listingId, status: 'ACTIVE' },
    });
    if (!listing)
      throw new RpcBadRequestException('Объявление не найдено или уже продано');
    if (listing.sellerId === buyerId)
      throw new RpcBadRequestException(
        'Предмет уже принадлежит вам, нельзя купить свой собственный предмет'
      );

    // начало саги
    try {
      await lastValueFrom(
        this.paymentClient.send('payment.debit.v1', {
          userId: buyerId,
          amount: listing.price,
        })
      );
      this.logger.log(`1/3 Средства успешно списаны с ${buyerId}`);
    } catch (error) {
      this.logger.log(
        `1/3 Провал. Средства не были списаны, недостаточно средств`
      );
      throw new RpcBadRequestException('Недостаточно средств');
    }

    try {
      await lastValueFrom(
        this.inventoryClient.send('inventory.transfer-item.v1', {
          itemId: listing.itemId,
          currentOwner: listing.sellerId,
          newOwner: buyerId,
        })
      );
      this.logger.log(
        `2/3 Предмет ${listing.itemId} успешно передан ${buyerId}`
      );
    } catch (error: any) {
      this.logger.log(
        `2/3 Провал. Ошибка при передаче предмета. Запуск компенсации`
      );
      await lastValueFrom(
        this.paymentClient.send('payment.credit.v1', {
          userId: buyerId,
          amount: listing.price,
        })
      );
      this.logger.log(
        `Компенсация средств произошла успешно пользователю ${buyerId}`
      );
      throw new RpcConflictException(`Не удалось предмет, ${error.message}`);
    }

    try {
      await lastValueFrom(
        this.paymentClient.send('payment.credit.v1', {
          userId: listing.sellerId,
          amount: listing.price, // можно добавить комиссию сервиса
        })
      );
      this.logger.log(
        `3/3 Средства ${listing.price} зачислены на счет продавца ${listing.sellerId}`
      );
    } catch (error: any) {
      this.logger.log(
        `3/3 Провал. Ошибка зачисления на баланс продавца, необходимо ручное вмешательство`
      );
    }
    await this.prismaService.listing.update({
      where: { id: listingId },
      data: { status: 'SOLD' },
    });
    return {
      success: true,
      message: 'Покупка прошла успешно, средства списаны, предмет передан вам.',
    };
  }
}
