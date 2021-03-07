import { IsEmail, IsString, IsNotEmpty, MinLength } from 'class-validator';

export default class UserLoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(7)
  password: string;
}
