import { Inject, Injectable, Logger } from '@nestjs/common';
import { MICROSERVICE_LIST } from '@backend/constants';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { Item } from '@prisma/client';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class InventoryService {
  constructor(
    @Inject(MICROSERVICE_LIST.INVENTORY_SERVICE)
    private readonly inventoryClient: ClientProxy,
    private readonly httpService: HttpService,
    private readonly logger: Logger
  ) {}
  async getUserItems(userId: string) {
    const itemInstances: Item[] | [] = await lastValueFrom(
      this.inventoryClient.send('inventory.get-items-by-user-id.v1', userId)
    );
    const fullItems = await Promise.all(
      itemInstances.map(async (instance) => {
        try {
          const response = await lastValueFrom(
            this.httpService.get(`/items/${instance.externalId}`)
          );
          const baseItem = response.data;

          return { ...instance, ...baseItem };
        } catch (error) {
          this.logger.error(
            `Could not fetch details for item ${instance.externalId}`,
            error
          );
          return instance;
        }
      })
    );
    return fullItems;
  }
}
