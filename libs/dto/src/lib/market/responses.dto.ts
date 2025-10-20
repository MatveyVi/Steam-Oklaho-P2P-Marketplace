import { Exclude, Expose } from 'class-transformer';

export class ListingResponseDto {
  @Expose()
  id!: string;
  @Expose()
  itemId!: string;
  @Exclude()
  sellerId!: string;
  @Expose()
  price!: string;
  @Expose()
  status!: string;
  @Expose()
  createdAt!: Date;
  @Exclude()
  updatedAt!: Date;
  @Expose()
  nickname!: string;
  @Expose()
  name!: string;
  @Expose()
  imageUrl!: string;
}
export class ListingsResponseDto {
  data!: ListingResponseDto[];
  meta!: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
