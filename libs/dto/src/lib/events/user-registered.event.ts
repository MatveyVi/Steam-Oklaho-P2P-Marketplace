export class UserRegisteredEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly registeredAt: string
  ) {}

  toString() {
    return JSON.stringify({
      userId: this.userId,
      email: this.email,
      registeredAt: this.registeredAt,
    });
  }
}
