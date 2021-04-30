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
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import UserRegisterDto from './dto/userRegister.dto';
import LocalAuthGuard from '../common/guards/localAuth.guard';
import RequestWithUser from '../common/interfaces/requestWithUser.interface';
import { ROLES } from '../common/constants/roles.constants';
import User from '../users/entities/user.entity';
import UserSession from '../common/interfaces/session.interface';
import Facility from '../facilities/entities/facility.entity';
import FacilityRefreshTokenDto from './dto/facilityRefreshToken.dto';
import GenerateFacilityTokenDto from './dto/generateFacilityToken.dto';
import { FacilityTokens } from '../common/interfaces/facilityTokens.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('ping')
  public ping() {
    return 'PONG';
  }

  @Post('users/register')
  @UsePipes(ValidationPipe)
  @UseInterceptors(ClassSerializerInterceptor)
  async registerUser(
    @Body() registrationData: UserRegisterDto,
    @Session() session: UserSession,
  ): Promise<User> {
    const user: User = await this.authService.registerUser(registrationData);
    user.token = await this.authService.generateToken({
      id: user.id,
      r: ROLES.USER,
    });
    session.jwt = user.token;
    return user;
  }

  @Post('users/login')
  @HttpCode(200)
  @UseGuards(LocalAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async logInUser(
    @Req() request: RequestWithUser,
    @Session() session: UserSession,
  ): Promise<User> {
    const { user } = request;
    if (session.jwt) {
      try {
        await this.authService.verifyToken(session.jwt);
        user.token = session.jwt;
        return user;
      } catch (error) {}
    }
    user.token = await this.authService.generateToken({
      id: user.id,
      r: ROLES.USER,
    });
    session.jwt = user.token;
    return user;
  }

  @Post('users/logout')
  @HttpCode(204)
  @UseInterceptors(ClassSerializerInterceptor)
  logout(@Session() session: UserSession): void {
    session.jwt = undefined;
  }

  @HttpCode(200)
  @Post('facilities/access_token')
  @UsePipes(ValidationPipe)
  @UseInterceptors(ClassSerializerInterceptor)
  async generateFacilityToken(
    @Body() generateFacilityTokenDto: GenerateFacilityTokenDto,
  ): Promise<FacilityTokens> {
    return this.authService.generateFacilityTokens(generateFacilityTokenDto);
  }

  @Post('facilities/refresh_token')
  @HttpCode(200)
  @UseInterceptors(ClassSerializerInterceptor)
  async refreshFacilityToken(
    @Body() refreshTokenData: FacilityRefreshTokenDto,
  ): Promise<Facility> {
    return this.authService.refreshFacilityToken(refreshTokenData);
  }
}
