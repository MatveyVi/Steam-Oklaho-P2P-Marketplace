export class ProfileCreatedEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly nickname: string
  ) {}
}
