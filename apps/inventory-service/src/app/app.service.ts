import { Inject, Injectable, Logger } from '@nestjs/common';
import { AddFakeItemDto } from '@backend/dto';
import { PrismaService } from '@backend/database';
import { MICROSERVICE_LIST } from '@backend/constants';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import {
  RpcBadRequestException,
  RpcConflictException,
  RpcForbiddenException,
  RpcNotFoundException,
} from '@backend/exceptions';
import { Item } from '@prisma/client';

@Injectable()
export class AppService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly logger: Logger,
    @Inject(MICROSERVICE_LIST.CATALOG_SERVICE)
    private readonly catalogClient: ClientProxy
  ) {}

  async addFakeItem(dto: AddFakeItemDto): Promise<Item> {
    this.logger.log(
      `Добавляем предмет ${dto.externalId} пользователю ${dto.userId}`
    );

    const baseItem = await lastValueFrom(
      this.catalogClient.send('catalog.find-by-external-id.v1', dto.externalId)
    );
    if (!baseItem)
      throw new RpcBadRequestException(
        `Предмет с externalId: ${dto.externalId} не существует`
      );

    const randomFloat = Math.random();
    const randomPattern = Math.floor(Math.random() * 1000);

    return this.prismaService.item.create({
      data: {
        ownerId: dto.userId,
        externalId: dto.externalId,
        float: randomFloat,
        pattern: randomPattern,
      },
    });
  }

  async getItemsById(userId: string): Promise<Item[]> {
    this.logger.log(`Получаем предметы в инветаре пользователя ${userId}`);
    const itemsInstance: Item[] = await this.prismaService.item.findMany({
      where: {
        ownerId: userId,
      },
    });
    if (!itemsInstance || itemsInstance.length === 0) return [];
    return itemsInstance;
  }

  async lockItem(dto: { userId: string; itemId: string }): Promise<string> {
    const item = await this.prismaService.item.findUnique({
      where: {
        id: dto.itemId,
      },
    });
    if (!item) throw new RpcNotFoundException('Предмет не найден');
    if (item.ownerId !== dto.userId)
      throw new RpcForbiddenException('Вы не владеете этим предметом');
    if (item.status !== 'AVAILABLE')
      throw new RpcConflictException('Предмет уже стоит на продаже');
    await this.prismaService.item.update({
      where: {
        id: dto.itemId,
      },
      data: {
        status: 'LISTED',
      },
    });
    return item.externalId;
  }

  async unlockItem(dto: { userId: string; itemId: string }): Promise<void> {
    const item = await this.prismaService.item.findUnique({
      where: {
        id: dto.itemId,
      },
    });
    if (!item) throw new RpcNotFoundException('Предмет не найден');
    if (item.ownerId !== dto.userId)
      throw new RpcForbiddenException('Вы не владеете этим предметом');
    if (item.status !== 'LISTED')
      throw new RpcConflictException('Предмет не стоит на продаже');
    await this.prismaService.item.update({
      where: {
        id: dto.itemId,
      },
      data: {
        status: 'AVAILABLE',
      },
    });
  }
}
