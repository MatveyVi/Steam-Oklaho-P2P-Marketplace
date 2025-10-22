import { PrismaService } from '@backend/database';
import { Injectable, Logger } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { RpcBadRequestException } from '@backend/exceptions';
import { Stripe } from 'stripe';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  private readonly stripe: Stripe;
  constructor(
    private readonly prismaService: PrismaService,
    private readonly logger: Logger,
    configService: ConfigService
  ) {
    this.stripe = new Stripe(
      configService.getOrThrow<string>('STRIPE_SECRET_KEY')
    );
  }

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

  async getBalance(userId: string) {
    this.logger.log(`Запрос на получение баланса ${userId}`);
    return this.prismaService.balance.findUnique({
      where: { userId },
      select: { amount: true },
    });
  }

  async stripeDeposit(userId: string, amount: number) {
    let amountInCents = Math.round(amount * 100);
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      payment_method: 'pm_card_visa',
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      },
    });
    await this.prismaService.transaction.create({
      data: {
        userId,
        amount,
        paymentIntentId: paymentIntent.id,
        status: 'PENDING',
      },
    });

    return { status: paymentIntent.status };
  }

  async handleSuccessfulPayment(paymentIntentId: string) {
    this.logger.log(`Обработка успешного платежа ${paymentIntentId}`);

    const transaction = await this.prismaService.transaction.findUnique({
      where: { paymentIntentId },
    });

    if (transaction && transaction.status === 'PENDING') {
      await this.prismaService.$transaction([
        this.prismaService.transaction.update({
          where: { paymentIntentId },
          data: { status: 'COMPLETED' },
        }),
        this.prismaService.balance.update({
          where: { userId: transaction.userId },
          data: { amount: { increment: transaction.amount } },
        }),
      ]);
      this.logger.log(
        `Баланс ${transaction.userId} пополнен на ${transaction.amount}`
      );
    } else {
      this.logger.warn(
        `Платеж ${paymentIntentId} уже был обработан или не найден.`
      );
    }
  }

  async handleFailedPayment(paymentIntentId: string) {
    this.logger.log(`Обработка неуспешного платежа ${paymentIntentId}`);

    const transaction = await this.prismaService.transaction.findUnique({
      where: { paymentIntentId },
    });
    if (transaction && transaction.status === 'PENDING') {
      await this.prismaService.transaction.update({
        where: { paymentIntentId },
        data: { status: 'FAILED' },
      });
      this.logger.log(`Транзакия не была произведена. Платеж отклонен`);
    } else {
      this.logger.warn(
        `Платеж ${paymentIntentId} уже был обработан или не найден.`
      );
    }
  }
}
