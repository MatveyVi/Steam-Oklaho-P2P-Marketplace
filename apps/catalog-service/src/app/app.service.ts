import { Injectable } from '@nestjs/common';
import { PrismaService } from '@backend/database';

@Injectable()
export class AppService {
  constructor(private readonly prismaService: PrismaService) {}

  findAll() {
    return this.prismaService.baseItem.findMany();
  }

  findByExternalId(externalId: string) {
    return this.prismaService.baseItem.findUnique({
      where: {
        externalId,
      },
    });
  }
}
