import { Inject, Injectable, Logger } from '@nestjs/common';
import { AddFakeItemDto } from '@backend/dto';
import { PrismaService } from '@backend/database';
import { MICROSERVICE_LIST } from '@backend/constants';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { RpcBadRequestException } from '@backend/exceptions';
import { Item } from '@prisma/client';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class AppService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly logger: Logger,
    @Inject(MICROSERVICE_LIST.CATALOG_SERVICE)
    private readonly catalogClient: ClientProxy,
    private readonly httpService: HttpService
  ) {}

  async addFakeItem(dto: AddFakeItemDto) {
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

  async getItemsById(userId: string) {
    this.logger.log(`Получаем предметы в инветаре пользвоателя ${userId}`);
    const itemsInstance: Item[] = await this.prismaService.item.findMany({
      where: {
        ownerId: userId,
      },
    });
    if (!itemsInstance || itemsInstance.length === 0) return [];

    const fullItems = await Promise.all(
      itemsInstance.map(async (instance) => {
        try {
          const response = await lastValueFrom(
            this.httpService.get(`items/${instance.externalId}`)
          );
          const baseItem = response.data;
          return { ...instance, ...baseItem };
        } catch (error) {
          this.logger.log(
            `Ошибка при получении данных об ${instance.externalId}`
          );
          return instance;
        }
      })
    );
    return fullItems;
  }
}
