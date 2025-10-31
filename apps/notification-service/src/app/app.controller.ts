import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
import { EventPattern, Payload } from '@nestjs/microservices';
import {
  ItemTransfer,
  ItemTransferError,
  PaymentWithdrawal,
  ProfileCreatedEvent,
} from '@backend/dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @EventPattern('profile.created.v1')
  async handleUserRegistered(@Payload() data: ProfileCreatedEvent) {
    return this.appService.userRegistered(data);
  }

  @EventPattern('payment.balance-update.v1')
  async handleBalanceUpdate(@Payload() data: PaymentWithdrawal) {
    return this.appService.balanceUpdate(data);
  }

  @EventPattern('market.item-sold.v1')
  async handleItemBought(@Payload() data: ItemTransfer) {
    return this.appService.itemTransfer(data);
  }

  @EventPattern('market.item-transfer-fail.v1')
  async handleItemTransferFail(@Payload() data: ItemTransferError) {
    return this.appService.itemTransferFail(data);
  }

  @EventPattern('market.payout-fail.v1')
  async handlePayoutFail(@Payload() data: ItemTransfer) {
    return this.appService.payoutFail(data);
  }
}
