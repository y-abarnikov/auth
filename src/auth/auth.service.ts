import * as bcrypt from 'bcrypt';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import UserLoginDto from "./dto/userLogin.dto";
import UserRegisterDto from './dto/userRegister.dto';
import { PostgresErrorCode } from '../common/constants/postgres.constants';
import User from '../users/entities/user.entity';
import { RegistrationKeysService } from '../registration-keys/registration-keys.service';
import RegistrationKey from '../registration-keys/entities/registrationKey.entity';
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import TokenPayload from "../common/interfaces/tokenPayload.interface";
import FacilityRegisterDto from "./dto/facilityRegister.dto";
import { FacilitiesService } from "../facilities/facilities.service";
import Facility from "../facilities/entities/facility.entity";
import FacilityRefreshTokenDto from "./dto/facilityRefreshToken.dto";
import { ROLES } from "../common/constants/roles.constants";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly facilitiesService: FacilitiesService,
    private readonly registrationKeysService: RegistrationKeysService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  public async registerUser(registrationData: UserRegisterDto): Promise<User> {
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

  public async authenticateUser(loginData: UserLoginDto) {
    try {
      const user: User = await this.usersService.getByEmail(loginData.email);
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

  public async registerFacility(registrationData: FacilityRegisterDto): Promise<Facility> {
    let facility;
    try {
      facility = await this.facilitiesService.create(registrationData);
    } catch (error) {
      if (error?.code === PostgresErrorCode.UniqueViolation) {
        throw new HttpException('Facility with that serial number already exists', HttpStatus.BAD_REQUEST);
      }

      throw error;
    }

    return facility;
  }

  public async refreshFacilityToken(refreshTokenData: FacilityRefreshTokenDto): Promise<Facility> {
    let facility: Facility = await this.facilitiesService.getByRefreshToken(refreshTokenData.refreshToken);
    facility = await this.facilitiesService.renewRefreshToken(facility);
    facility.token = await this.generateToken({ id: facility.id, r: ROLES.FACILITY });
    return facility;
  }


  public async generateToken(payload: TokenPayload): Promise<string> {
    return this.jwtService.signAsync(payload, { secret: this.configService.get<string>('JWT_SECRET') });
  }

  public async verifyToken(token: string): Promise<any> {
    return this.jwtService.verifyAsync(token, { secret: this.configService.get<string>('JWT_SECRET') });
  }
}
