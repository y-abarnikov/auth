import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  Post,
  Req, Session,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import {AuthService} from './auth.service';
import RegisterDto from './dto/register.dto';
import LocalAuthGuard from './guards/localAuth.guard';
import RequestWithUser from './interfaces/requestWithUser.interface';
import { ROLES } from '../common/constants/roles.constants';
import User from '../users/entities/user.entity';
import UserSession from "../common/interfaces/session.interface";

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
  async register(@Body() registrationData: RegisterDto, @Session() session: UserSession): Promise<User> {
    const user: User = await this.authService.register(registrationData);
    user.token = await this.authService.generateToken({ userId: user.id, r: ROLES.USER });
    session.jwt = user.token;
    return user;
  }

  @Post('users/login')
  @HttpCode(200)
  @UseGuards(LocalAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async logIn(@Req() request: RequestWithUser, @Session() session: UserSession): Promise<User> {
    const { user } = request;
    if (session.jwt) {
      try {
        await this.authService.verifyToken(session.jwt);
        user.token = session.jwt;
        return user;
      } catch (error) {}
    }
    user.token = await this.authService.generateToken({ userId: user.id, r: ROLES.USER });
    session.jwt = user.token;
    return user;
  }

  @Post('users/logout')
  @HttpCode(204)
  @UseInterceptors(ClassSerializerInterceptor)
  logout(@Session() session: UserSession): void {
    session.jwt = undefined;
  }
}
