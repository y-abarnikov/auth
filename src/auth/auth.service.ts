import * as bcrypt from 'bcrypt';
import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import UserLoginDto from './dto/userLogin.dto';
import UserRegisterDto from './dto/userRegister.dto';
import { PostgresErrorCode } from '../common/constants/postgres.constants';
import User from '../users/entities/user.entity';
import { RegistrationKeysService } from '../registration-keys/registration-keys.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import TokenPayload from '../common/interfaces/tokenPayload.interface';
import { FacilitiesService } from '../facilities/facilities.service';
import Facility from '../facilities/entities/facility.entity';
import FacilityRefreshTokenDto from './dto/facilityRefreshToken.dto';
import { ROLES } from '../common/constants/roles.constants';
import { FacilityTokens } from 'src/common/interfaces/facilityTokens.interface';
import GenerateFacilityTokenDto from './dto/generateFacilityToken.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly facilitiesService: FacilitiesService,
    private readonly registrationKeysService: RegistrationKeysService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  public async registerUser(registrationData: UserRegisterDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(registrationData.password, 10);
    let createdUser: User;
    try {
      createdUser = await this.usersService.create({
        ...registrationData,
        password: hashedPassword,
      });
    } catch (error) {
      if (error?.code === PostgresErrorCode.UniqueViolation) {
        throw new HttpException(
          'User with that email already exists',
          HttpStatus.BAD_REQUEST,
        );
      }

      throw error;
    }

    createdUser.token = await this.generateToken({
      id: createdUser.id,
      r: ROLES.USER,
    });

    return createdUser;
  }

  public async authenticateUser(loginData: UserLoginDto) {
    let user: User;
    try {
      user = await this.usersService.getByEmail(loginData.email);
      await this.verifyPassword(loginData.password, user.password);
    } catch (error) {
      throw new HttpException(
        'Wrong credentials provided',
        HttpStatus.UNAUTHORIZED,
      );
    }

    user.token = await this.generateToken({
      id: user.id,
      r: ROLES.USER,
    });

    return user;
  }

  private async verifyPassword(
    plainTextPassword: string,
    hashedPassword: string,
  ) {
    const isPasswordMatching = await bcrypt.compare(
      plainTextPassword,
      hashedPassword,
    );
    if (!isPasswordMatching) {
      throw new HttpException(
        'Wrong credentials provided',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  public async refreshFacilityToken(
    refreshTokenData: FacilityRefreshTokenDto,
  ): Promise<Facility> {
    let facility: Facility = await this.facilitiesService.getByRefreshToken(
      refreshTokenData.refreshToken,
    );
    facility = await this.facilitiesService.renewRefreshToken(facility);
    facility.token = await this.generateToken({
      id: facility.id,
      r: ROLES.FACILITY,
    });
    return facility;
  }

  public async generateToken(payload: TokenPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
    });
  }

  public async verifyToken(token: string): Promise<any> {
    return this.jwtService.verifyAsync(token, {
      secret: this.configService.get<string>('JWT_SECRET'),
    });
  }

  public async generateFacilityTokens(
    generateFacilityTokenDto: GenerateFacilityTokenDto,
  ): Promise<FacilityTokens> {
    const facility: Facility = await this.facilitiesService.getByRegistrationKey(
      generateFacilityTokenDto.registrationKey,
    );

    if (!facility) {
      throw new NotFoundException('Facilty not found!');
    }

    const accessToken = await this.generateToken({
      id: facility.id,
      r: ROLES.FACILITY,
    });
    const facilityWithNewRefreshToken: Facility = await this.facilitiesService.renewRefreshToken(
      facility,
    );

    return {
      access_token: accessToken,
      refresh_token: facilityWithNewRefreshToken.refreshToken,
    } as FacilityTokens;
  }
}
