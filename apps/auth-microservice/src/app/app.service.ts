import { Injectable } from '@nestjs/common';
import { LoginUserDto, RegisterUserDto } from '@backend/dto';
import { PrismaService } from '@backend/database';
import { JwtService } from '@backend/jwt';
import { hash, verify } from 'argon2';
import {
  RpcBadRequestException,
  RpcUnauthorizedException,
} from '@backend/exceptions';

@Injectable()
export class AppService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  async register(dto: RegisterUserDto) {
    const { name, email, password } = dto;
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (existingUser)
      throw new RpcBadRequestException('Пользователь уже существует');
    const passwordHash = await hash(password);

    const newUser = await this.prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
    });

    const tokens = await this.generateTokens(newUser.id);

    // TODO Emit in kafka

    return tokens;
  }

  async login(dto: LoginUserDto) {
    const { email, password } = dto;
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) throw new RpcUnauthorizedException('Неверный логин или пароль');
    const isPassValid = await verify(user.passwordHash, password);
    if (!isPassValid)
      throw new RpcUnauthorizedException('Неверный логин или пароль');
    const tokens = await this.generateTokens(user.id);

    return tokens;
  }

  async refreshTokens(userId: string) {
    const user = this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
      },
    });
    if (!user)
      throw new RpcUnauthorizedException('Недействительный пользователь');

    const tokens = await this.generateTokens(userId);

    return tokens;
  }

  private async generateTokens(userId: string) {
    const accessToken = await this.jwtService.generateAccessToken({
      sub: userId,
    });
    const refreshToken = await this.jwtService.generateRefreshToken({
      sub: userId,
    });

    return { accessToken, refreshToken };
  }
}
