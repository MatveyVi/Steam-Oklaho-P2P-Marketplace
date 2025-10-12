import { IsString } from 'class-validator';

export class AddFakeItemDto {
  @IsString()
  userId!: string;

  @IsString()
  externalId!: string;
}
