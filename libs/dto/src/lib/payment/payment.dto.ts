export interface Balance {
  amount: number;
}

export class PaymentWithdrawal {
  constructor(
    public readonly userId: string,
    public readonly type: 'deposit' | 'withdraw',
    public readonly amount: number
  ) {}
}
