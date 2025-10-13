import { Inject, Injectable, Logger } from '@nestjs/common';
import { CreateListingDto } from '@backend/dto';
import { lastValueFrom } from 'rxjs';
import { MICROSERVICE_LIST } from '@backend/constants';
import { ClientProxy } from '@nestjs/microservices';
import { RpcBadRequestException } from '@backend/exceptions';
import { PrismaService } from '@backend/database';

@Injectable()
export class AppService {
  constructor(
    private readonly logger: Logger,
    @Inject(MICROSERVICE_LIST.INVENTORY_SERVICE)
    private readonly inventoryClient: ClientProxy,
    private readonly prismaService: PrismaService
  ) {}
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
}
