import { Controller, Get, Inject, Logger, Param } from '@nestjs/common';
import { MICROSERVICE_LIST } from '@backend/constants';
import { ClientProxy } from '@nestjs/microservices';
import { Auth } from '../app/decorators/auth.decorator';
import { GetCurrentUser } from '../app/decorators/get-current-user.decorator';

@Controller('users')
export class UserController {
  constructor(
    @Inject(MICROSERVICE_LIST.USER_SERVICE)
    private readonly userClient: ClientProxy,
    private readonly logger: Logger
  ) {}

  @Get('me')
  @Auth()
  async getProfileById(@GetCurrentUser() userId: string) {
    this.logger.log(`Запрос на получение профиля от ${userId}`);
    return this.userClient.send('user.get-profile-by-id.v1', userId);
  }

  @Get(':nickname')
  async getProfileByNickname(@Param('nickname') nickname: string) {
    this.logger.log(`Запрос на получения пользователя: ${nickname}`);
    return this.userClient.send('user.get-profile-by-nickname.v1', nickname);
  }
}
