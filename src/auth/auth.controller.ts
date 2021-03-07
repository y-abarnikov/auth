import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Session,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import {AuthService} from './auth.service';
import UserRegisterDto from './dto/userRegister.dto';
import LocalAuthGuard from '../common/guards/localAuth.guard';
import RequestWithUser from '../common/interfaces/requestWithUser.interface';
import { ROLES } from '../common/constants/roles.constants';
import User from '../users/entities/user.entity';
import UserSession from '../common/interfaces/session.interface';
import FacilityRegisterDto from './dto/facilityRegister.dto';
import { Roles } from '../common/decorators/role.decorator';
import {RolesGuard} from '../common/guards/role.guard';
import Facility from '../facilities/entities/facility.entity';
import JwtAuthGuard from '../common/guards/jwtAuth.guard';
import FacilityRefreshTokenDto from "./dto/facilityRefreshToken.dto";

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Get('ping')
  public ping() {
    return 'PONG';
  }

  @Post('users/register')
  @UseInterceptors(ClassSerializerInterceptor)
  async registerUser(@Body() registrationData: UserRegisterDto, @Session() session: UserSession): Promise<User> {
    const user: User = await this.authService.registerUser(registrationData);
    user.token = await this.authService.generateToken({ id: user.id, r: ROLES.USER });
    session.jwt = user.token;
    return user;
  }

  @Post('users/login')
  @HttpCode(200)
  @UseGuards(LocalAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async logInUser(@Req() request: RequestWithUser, @Session() session: UserSession): Promise<User> {
    const { user } = request;
    if (session.jwt) {
      try {
        await this.authService.verifyToken(session.jwt);
        user.token = session.jwt;
        return user;
      } catch (error) {}
    }
    user.token = await this.authService.generateToken({ id: user.id, r: ROLES.USER });
    session.jwt = user.token;
    return user;
  }

  @Post('users/logout')
  @HttpCode(204)
  @UseInterceptors(ClassSerializerInterceptor)
  logout(@Session() session: UserSession): void {
    session.jwt = undefined;
  }

  @Post('facilities/register')
  @Roles(ROLES.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async registerFacility(@Body() registrationData: FacilityRegisterDto): Promise<Facility> {
    const facility: Facility = await this.authService.registerFacility(registrationData);
    facility.token = await this.authService.generateToken({ id: facility.id, r: ROLES.FACILITY });
    return facility;
  }

  @Post('facilities/refresh_token')
  @HttpCode(200)
  @UseInterceptors(ClassSerializerInterceptor)
  async refreshFacilityToken(@Body() refreshTokenData: FacilityRefreshTokenDto): Promise<Facility> {
    return this.authService.refreshFacilityToken(refreshTokenData);
  }
}
