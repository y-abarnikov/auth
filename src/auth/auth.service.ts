import * as bcrypt from 'bcrypt';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import LogInDto from "./dto/login.dto";
import RegisterDto from './dto/register.dto';
import { PostgresErrorCode } from '../common/constants/postgres.constants';
import User from '../users/entities/user.entity';
import { RegistrationKeysService } from '../registration-keys/registration-keys.service';
import RegistrationKey from '../registration-keys/entities/registrationKey.entity';
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import TokenPayload from "./interfaces/tokenPayload.interface";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly registrationKeysService: RegistrationKeysService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
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

      throw error;
    }
  }

  public async authenticateUser(loginData: LogInDto) {
    try {
      const user = await this.usersService.getByEmail(loginData.email);
      await this.verifyPassword(loginData.password, user.password);
      return user;
    } catch (error) {
      throw new HttpException('Wrong credentials provided', HttpStatus.UNAUTHORIZED);
    }
  }

  private async verifyPassword(plainTextPassword: string, hashedPassword: string) {
    const isPasswordMatching = await bcrypt.compare(
      plainTextPassword,
      hashedPassword
    );
    if (!isPasswordMatching) {
      throw new HttpException('Wrong credentials provided', HttpStatus.UNAUTHORIZED);
    }
  }

  public generateToken(payload: TokenPayload) {
    return this.jwtService.sign(payload);
  }

  public async verifyToken(token: string) {
    return this.jwtService.verify(token, { secret: this.configService.get<string>('JWT_SECRET') });
  }
}
