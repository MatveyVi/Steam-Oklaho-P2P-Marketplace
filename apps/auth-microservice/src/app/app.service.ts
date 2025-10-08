import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginUserDto, RegisterUserDto } from '@backend/dto';
import { PrismaService } from '@backend/database';
import { JwtService } from '@backend/jwt';
import { hash, verify } from 'argon2';
import { User } from '@prisma/client';

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
      throw new BadRequestException('Пользователь уже существует');

    const passwordHash = await hash(password);

    const newUser = await this.prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
    });

    const tokens = await this.generateTokens(newUser);

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
    if (!user) throw new UnauthorizedException('Неверный логин или пароль');
    const isPassValid = await verify(user.passwordHash, password);
    if (!isPassValid)
      throw new UnauthorizedException('Неверный логин или пароль');
    const tokens = await this.generateTokens(user);

    return tokens;
  }

  private async generateTokens(user: User) {
    const accessToken = await this.jwtService.generateAccessToken({
      sub: user.id,
      email: user.email,
    });
    const refreshToken = await this.jwtService.generateRefreshToken({
      sub: user.id,
    });

    return { accessToken, refreshToken };
  }
}
