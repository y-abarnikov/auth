import { IsEmail, IsString, IsNotEmpty, MinLength } from 'class-validator';

export default class LogInDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(7)
  password: string;
}
