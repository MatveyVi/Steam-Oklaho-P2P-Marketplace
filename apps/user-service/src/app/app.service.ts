import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '@backend/database';
import { RpcBadRequestException } from '@backend/exceptions';
import {
  MyProfileResponseDto,
  ProfileCreatedEvent,
  ProfileResponseDto,
  UserRegisteredEvent,
} from '@backend/dto';
import {} from '@backend/dto';
import { Profile } from '@prisma/client';
import { MICROSERVICE_LIST } from '@backend/constants';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AppService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(MICROSERVICE_LIST.KAFKA_SERVICE)
    private readonly kafkaClient: ClientProxy
  ) {}

  async createProfile(data: UserRegisteredEvent): Promise<Profile> {
    const { userId, email } = data;
    const defaultNickName = email.split('@')[0];

    const profile = await this.prismaService.profile.create({
      data: {
        userId,
        email,
        nickname: defaultNickName,
      },
    });
    const profileEvent = new ProfileCreatedEvent(
      userId,
      email,
      defaultNickName
    );
    this.kafkaClient.emit('profile.created.v1', profileEvent);
    return profile;
  }

  async findProfileById(userId: string): Promise<MyProfileResponseDto> {
    const user = await this.prismaService.profile.findUnique({
      where: {
        userId: userId,
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
    if (!user) throw new RpcBadRequestException('Профиль не существует');
    return user;
  }

  async findProfilesByIds(userIds: string[]): Promise<Profile[]> {
    return this.prismaService.profile.findMany({
      where: { userId: { in: userIds } },
    });
  }

  async findProfileByNickname(nickname: string): Promise<ProfileResponseDto> {
    const user = await this.prismaService.profile.findUnique({
      where: {
        nickname: nickname,
      },
      select: {
        id: true,
        nickname: true,
        avatarUrl: true,
        bio: true,
        rating: true,
        createdAt: true,
      },
    });
    if (!user) throw new RpcBadRequestException('Профиль не существует');
    return user;
  }
}
