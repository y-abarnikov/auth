import { IsEmail, IsString, IsNotEmpty, MinLength } from 'class-validator';

export default class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(7)
  password: string;

  @IsString()
  @IsNotEmpty()
  registrationKey: string;
}