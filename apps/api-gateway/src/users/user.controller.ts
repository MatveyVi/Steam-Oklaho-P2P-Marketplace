import { Controller, Get, Inject } from '@nestjs/common';
import { MICROSERVICE_LIST } from '@backend/constants';
import { ClientProxy } from '@nestjs/microservices';
import { Auth } from '../app/decorators/auth.decorator';
import { GetCurrentUser } from '../app/decorators/get-current-user.decorator';

@Controller('users')
export class UserController {
  constructor(
    @Inject(MICROSERVICE_LIST.USER_SERVICE)
    private readonly userClient: ClientProxy
  ) {}

  @Get('me')
  @Auth()
  async getProfileById(@GetCurrentUser() userId: string) {
    console.log('controller');
    return this.userClient.send('users.get-profile-by-id.v1', userId);
  }
}
