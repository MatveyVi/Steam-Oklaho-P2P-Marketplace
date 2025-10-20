import { PrismaService } from '@backend/database';
import { Injectable, Logger } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { RpcBadRequestException } from '@backend/exceptions';

@Injectable()
export class AppService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly logger: Logger
  ) {}

  async createBalance(userId: string) {
    return this.prismaService.balance.create({
      data: {
        userId,
      },
    });
  }

  async testDeposit(userId: string, amount: Decimal) {
    this.logger.log(
      `Зачисление баланса на ${userId} в размере ${amount} (тестовый эндпоинт)`
    );
    await this.prismaService.balance.findFirstOrThrow({
      where: { userId },
    });
    return this.prismaService.balance.update({
      where: { userId },
      data: { amount: { increment: amount } },
    });
  }

  async debit(userId: string, amount: Decimal) {
    this.logger.log(`Списание ${amount} с ${userId}`);

    return this.prismaService.$transaction(async (prisma) => {
      const balance = await prisma.balance.findUniqueOrThrow({
        where: { userId },
      });
      if (balance.amount.lessThan(amount)) {
        throw new RpcBadRequestException('Недостаточно средств');
      }
      return prisma.balance.update({
        where: { userId },
        data: { amount: { decrement: amount } },
      });
    });
  }

  async credit(userId: string, amount: Decimal) {
    this.logger.log(`Зачисление ${amount} на ${userId}`);
    return this.prismaService.balance.update({
      where: { userId },
      data: { amount: { increment: amount } },
    });
  }
}
