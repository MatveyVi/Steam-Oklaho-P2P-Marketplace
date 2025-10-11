import { Injectable } from '@nestjs/common';
import { PrismaService } from '@backend/database';
import { UserRegisteredEvent } from '@backend/dto';

@Injectable()
export class AppService {
  constructor(private readonly prismaService: PrismaService) {}

  async createProfile(data: UserRegisteredEvent) {
    const { userId, email } = data;
    const defaultNickName = email.split('@')[0];

    return this.prismaService.profile.create({
      data: {
        userId,
        email,
        nickname: defaultNickName,
      },
    });
  }

  async getProfileById(userId: string) {
    return this.prismaService.profile.findUnique({
      where: {
        userId,
      },
      select: {
        userId: true,
        email: true,
        nickname: true,
        avatarUrl: true,
        bio: true,
        tradeUrl: true,
        rating: true,
        createdAt: true,
      },
    });
  }
}
