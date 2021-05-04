import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  Post,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import UserRegisterDto from './dto/userRegister.dto';
import LocalAuthGuard from '../common/guards/localAuth.guard';
import { ROLES } from '../common/constants/roles.constants';
import User from '../users/entities/user.entity';
import Facility from '../facilities/entities/facility.entity';
import FacilityRefreshTokenDto from './dto/facilityRefreshToken.dto';
import GenerateFacilityTokenDto from './dto/generateFacilityToken.dto';
import { FacilityTokens } from '../common/interfaces/facilityTokens.interface';
import UserLoginDto from './dto/userLogin.dto';

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
  async registerUser(@Body() registrationData: UserRegisterDto): Promise<User> {
    return this.authService.registerUser(registrationData);
  }

  @Post('users/login')
  @HttpCode(200)
  @UseGuards(LocalAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async logInUser(@Body() loginData: UserLoginDto): Promise<User> {
    return this.authService.authenticateUser(loginData);
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
