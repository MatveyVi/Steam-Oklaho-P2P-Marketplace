import { Inject, Injectable, Logger } from '@nestjs/common';
import { AddFakeItemDto } from '@backend/dto';
import { PrismaService } from '@backend/database';
import { MICROSERVICE_LIST } from '@backend/constants';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { RpcBadRequestException } from '@backend/exceptions';

@Injectable()
export class AppService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly logger: Logger,
    @Inject(MICROSERVICE_LIST.CATALOG_SERVICE)
    private readonly catalogClient: ClientProxy
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
}
