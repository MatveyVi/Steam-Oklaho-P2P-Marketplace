import { MICROSERVICE_LIST } from '@backend/constants';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { ResendMailer } from './resend/resend.service';
import {
  ItemTransfer,
  ItemTransferError,
  MyProfileResponseDto,
  PaymentWithdrawal,
  ProfileCreatedEvent,
} from '@backend/dto';
import { RpcConflictException } from '@backend/exceptions';
import { BaseItem } from '@prisma/client';

@Injectable()
export class AppService {
  constructor(
    @Inject(MICROSERVICE_LIST.USER_SERVICE)
    private readonly userClient: ClientProxy,
    @Inject(MICROSERVICE_LIST.CATALOG_SERVICE)
    private readonly catalogClient: ClientProxy,
    @Inject(MICROSERVICE_LIST.PAYMENT_SERVICE)
    private readonly paymentClient: ClientProxy,

    private readonly resendMailer: ResendMailer
  ) {}

  private async getProfile(userId: string): Promise<MyProfileResponseDto> {
    return lastValueFrom(
      this.userClient.send('user.get-profile-by-id.v1', userId)
    );
  }

  private async getBalance(userId: string): Promise<{ amount: string }> {
    return lastValueFrom(
      this.paymentClient.send('payment.get-balance.v1', userId)
    );
  }

  private async getItemFromCatalog(
    externalId: string
  ): Promise<BaseItem | null> {
    return lastValueFrom(
      this.catalogClient.send('catalog.find-by-external-id.v1', externalId)
    );
  }
  async userRegistered(data: ProfileCreatedEvent) {
    const profile = await this.getProfile(data.userId);
    return this.resendMailer.sendWelcomeEmail(data.email, profile.nickname);
  }

  async balanceUpdate(data: PaymentWithdrawal) {
    const profile = await this.getProfile(data.userId);
    const balance = await this.getBalance(data.userId);
    return this.resendMailer.sendBalanceUpdate(
      profile.email,
      data.type,
      data.amount,
      Number(balance.amount)
    );
  }

  async itemTransfer(data: ItemTransfer) {
    const sellerProfile = await this.getProfile(data.sellerId);
    const buyerProfile = await this.getProfile(data.buyerId);
    const item = await this.getItemFromCatalog(data.listing.externalId);
    if (!item) {
      throw new RpcConflictException('Проданного предмета не существует');
    }
    return await Promise.allSettled([
      this.resendMailer.sendSaleNotification(
        sellerProfile.email,
        item.name,
        Number(data.listing.price),
        buyerProfile.nickname,
        item.imageUrl
      ),
      this.resendMailer.sendPurchaseConfirmation(
        buyerProfile.email,
        item.name,
        Number(data.listing.price),
        sellerProfile.nickname,
        item.imageUrl
      ),
    ]);
  }

  async itemTransferFail(data: ItemTransferError) {
    const buyerProfile = await this.getProfile(data.buyerId);
    const item = await this.getItemFromCatalog(data.listing.externalId);
    if (!item) {
      throw new RpcConflictException('Проданного предмета не существует');
    }
    return this.resendMailer.sendPurchaseFailed(
      buyerProfile.email,
      item.name,
      Number(data.listing.price),
      data.reason
    );
  }

  async payoutFail(data: ItemTransfer) {
    const buyerProfile = await this.getProfile(data.buyerId);
    const sellerProfile = await this.getProfile(data.sellerId);
    const item = await this.getItemFromCatalog(data.listing.externalId);
    if (!item) {
      throw new RpcConflictException('Проданного предмета не существует');
    }
    return this.resendMailer.sendPayoutFailed(
      sellerProfile.email,
      item.name,
      Number(data.listing.price),
      buyerProfile.nickname
    );
  }
}
