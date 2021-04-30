import { IsEmail, IsNotEmpty } from 'class-validator';
import RegistrationKey from '../../registration-keys/entities/registrationKey.entity';

export default class CreateUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  registrationKey: RegistrationKey;
}
