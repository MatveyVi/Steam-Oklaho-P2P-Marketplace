import { Injectable } from '@nestjs/common';
import { PrismaService } from '@backend/database';
import { BaseItem } from '@prisma/client';

@Injectable()
export class AppService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(): Promise<BaseItem[]> {
    return this.prismaService.baseItem.findMany();
  }

  async findManyByIds(ids: string[]): Promise<BaseItem[]> {
    return this.prismaService.baseItem.findMany({
      where: {
        externalId: { in: ids },
      },
    });
  }

  async findByExternalId(externalId: string): Promise<BaseItem | null> {
    return this.prismaService.baseItem.findUnique({
      where: {
        externalId,
      },
    });
  }
}
