import { Body, Controller, Get, Inject, Logger, Post } from '@nestjs/common';
import { Auth } from '../app/decorators/auth.decorator';
import { MICROSERVICE_LIST } from '@backend/constants';
import { ClientProxy } from '@nestjs/microservices';
import { GetCurrentUser } from '../app/decorators/get-current-user.decorator';

@Controller('payment')
export class PaymentController {
  constructor(
    private readonly logger: Logger,
    @Inject(MICROSERVICE_LIST.PAYMENT_SERVICE)
    private readonly paymentClient: ClientProxy
  ) {}
  @Auth()
  @Post('test/deposit')
  async testDeposit(@Body() dto: { userId: string; amount: number }) {
    this.logger.log(
      `Зачисление тестового баланса на ${dto.userId}, в размере ${dto.amount}`
    );
    return this.paymentClient.send('payment.test-deposit.v1', {
      userId: dto.userId,
      amount: dto.amount,
    });
  }

  @Auth()
  @Get('balance')
  async getBalance(@GetCurrentUser() userId: string) {
    return this.paymentClient.send('payment.get-balance.v1', userId);
  }

  @Auth()
  @Post('deposit')
  async stripeDeposit(
    @GetCurrentUser() userId: string,
    @Body() dto: { amount: number }
  ) {
    this.logger.log(
      `Запрос на пополнение баланса на ${dto.amount} от ${userId} через Stripe`
    );
    return this.paymentClient.send('payment.initiate-deposit.v1', {
      userId,
      amount: dto.amount,
    });
  }

  @Auth()
  @Post('withdraw')
  async withdrawal(
    @GetCurrentUser() userId: string,
    @Body() dto: { amount: number }
  ) {
    this.logger.log(`Запрос на вывод средств от ${userId} на ${dto.amount}`);
    return this.paymentClient.send('payment.initiate-withdrawal.v1', {
      userId,
      amount: dto.amount,
    });
  }
}
