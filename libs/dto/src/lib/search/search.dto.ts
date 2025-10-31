export class IndexListingsDto {
  constructor(
    public readonly id: string,
    public readonly itemId: string,
    public readonly sellerId: string,
    public readonly price: string,
    public readonly status: Status,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly externalId: string,
    public readonly name?: string,
    public readonly imageUrl?: string,
    public readonly nickname?: string
  ) {}
}

export enum Status {
  ACTIVE = 'ACTIVE',
  SOLD = 'SOLD',
  DELETED = 'DELETED',
}

export class SearchListingParams {
  constructor(
    public readonly query: string,
    public readonly page: number,
    public readonly limit: number
  ) {}
}
