import { IsNumber, IsString, Max, Min } from 'class-validator';

export class CreateListingDto {
  @IsString()
  itemId!: string;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message: 'Цена должна содержать не более двух знаков после запятой.',
    }
  )
  @Min(0.01, {
    message: 'Цена должна быть положительным числом, не менее 0.01.',
  })
  @Max(10000.0, {
    message: 'Цена не должна превышать 10000.00',
  })
  price!: number;
}
