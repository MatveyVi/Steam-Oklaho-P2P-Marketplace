import { Listing } from '@prisma/client';

export class ItemTransfer {
  constructor(
    public readonly sellerId: string,
    public readonly buyerId: string,
    public readonly listing: Listing
  ) {}
}

export class ItemTransferError extends ItemTransfer {
  constructor(
    sellerId: string,
    buyerId: string,
    listing: Listing,
    public readonly reason: string
  ) {
    super(sellerId, buyerId, listing);
  }
}
