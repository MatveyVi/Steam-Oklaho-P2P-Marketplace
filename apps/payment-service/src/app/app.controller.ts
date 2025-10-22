import { Controller, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { UserRegisteredEvent } from '@backend/dto';
import { Decimal } from '@prisma/client/runtime/library';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly logger: Logger
  ) {}

  @EventPattern('user.registered.v1')
  async handleUserRegistered(@Payload() dto: UserRegisteredEvent) {
    this.logger.log(`Получен запрос на создание счета для юзера ${dto.email}`);
    await this.appService.createBalance(dto.userId);
  }

  @MessagePattern('payment.test-deposit.v1')
  handleTestDeposit(@Payload() data: { userId: string; amount: Decimal }) {
    return this.appService.testDeposit(data.userId, data.amount);
  }

  @MessagePattern('payment.debit.v1')
  handleDebit(@Payload() data: { userId: string; amount: Decimal }) {
    return this.appService.debit(data.userId, data.amount);
  }

  @MessagePattern('payment.credit.v1')
  handleCredit(@Payload() data: { userId: string; amount: Decimal }) {
    return this.appService.credit(data.userId, data.amount);
  }

  @MessagePattern('payment.get-balance.v1')
  handleGetBalance(@Payload() userId: string) {
    return this.appService.getBalance(userId);
  }

  @MessagePattern('payment.initiate-deposit.v1')
  handleStripeDeposit(@Payload() data: { userId: string; amount: number }) {
    return this.appService.stripeDeposit(data.userId, data.amount);
  }
}
