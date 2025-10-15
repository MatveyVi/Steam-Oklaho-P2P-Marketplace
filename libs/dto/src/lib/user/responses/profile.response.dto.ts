export class ProfileResponseDto {
  id!: string;
  nickname!: string;
  avatarUrl?: string | null;
  bio?: string | null;
  rating!: number;
  createdAt!: Date;
}
export class MyProfileResponseDto {
  userId!: string;
  email!: string;
  nickname!: string;
  avatarUrl!: string | null;
  bio!: string | null;
  tradeUrl!: string | null;
  rating!: number;
  createdAt!: Date;
}
