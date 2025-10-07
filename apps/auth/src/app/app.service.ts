import { Injectable } from '@nestjs/common';
import { LoginUserDto } from '@backend/dto';

@Injectable()
export class AppService {
  async login(dto: LoginUserDto) {
    return {
      message: 'Loggined',
    };
  }
}
