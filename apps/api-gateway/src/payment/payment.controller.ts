import { Body, Controller, Inject, Logger, Post } from '@nestjs/common';
import { Auth } from '../app/decorators/auth.decorator';
import { MICROSERVICE_LIST } from '@backend/constants';
import { ClientProxy } from '@nestjs/microservices';

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
}
