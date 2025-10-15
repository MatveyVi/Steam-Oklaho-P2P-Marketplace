import { Injectable } from '@nestjs/common';
import { PrismaService } from '@backend/database';
import { BaseItem } from '@prisma/client';

@Injectable()
export class AppService {
  constructor(private readonly prismaService: PrismaService) {}

  findAll(): Promise<BaseItem[]> {
    return this.prismaService.baseItem.findMany();
  }

  findByExternalId(externalId: string): Promise<BaseItem | null> {
    return this.prismaService.baseItem.findUnique({
      where: {
        externalId,
      },
    });
  }
}
