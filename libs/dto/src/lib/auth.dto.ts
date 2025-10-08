import { IsEmail, IsString, Length } from 'class-validator';

export class AuthCredentialsDto {
  @IsEmail({}, { message: 'Пожалуйста, введите корректный Email' })
  email!: string;

  @IsString()
  @Length(6, 50, {
    message: 'Пароль должен быть длиной не менее 6 и не более 50 символов',
  })
  password!: string;
}

export class LoginUserDto extends AuthCredentialsDto {}

export class RegisterUserDto extends AuthCredentialsDto {
  @IsString({
    message: 'Имя должно быть строкой',
  })
  @Length(2, 20, {
    message: 'Имя должно быть длиной не менее 2 и не более 20 символов',
  })
  name!: string;
}
