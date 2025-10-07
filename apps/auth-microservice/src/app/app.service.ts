import { Injectable } from '@nestjs/common';
import { LoginUserDto, RegisterUserDto } from '@backend/dto';

@Injectable()
export class AppService {
  async login(dto: LoginUserDto) {
    return {
      message: 'Loggined',
    };
  }

  async register(dto: RegisterUserDto) {
    return {
      message: 'Registered',
    };
  }
}
