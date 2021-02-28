import * as bcrypt from 'bcrypt';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import RegisterDto from './dto/register.dto';
import {PostgresErrorCode} from '../common/constants/postgres.constants';
import User from '../users/entities/user.entity';
import {RegistrationKeysService} from '../registration-keys/registration-keys.service';
import RegistrationKey from '../registration-keys/entities/registrationKey.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly registrationKeysService: RegistrationKeysService,
  ) {}

  public async register(registrationData: RegisterDto): Promise<User> {
    const registrationKey: RegistrationKey = await this.registrationKeysService.findByKey(registrationData.registrationKey);
    const hashedPassword = await bcrypt.hash(registrationData.password, 10);
    try {
      const createdUser = await this.usersService.create({
        ...registrationData,
        password: hashedPassword,
        registrationKey,
      });
      await this.registrationKeysService.useKey(registrationKey);
      return createdUser;
    } catch (error) {
      if (error?.code === PostgresErrorCode.UniqueViolation) {
        throw new HttpException('User with that email already exists', HttpStatus.BAD_REQUEST);
      }
      throw new HttpException('Something went wrong', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
