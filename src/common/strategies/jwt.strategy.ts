import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { FacilitiesService } from '../../facilities/facilities.service';
import TokenPayload from '../interfaces/tokenPayload.interface';
import { ROLES } from '../constants/roles.constants';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
    private readonly facilitiesService: FacilitiesService,
    private readonly reflector: Reflector,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: TokenPayload) {
    let entity;
    switch (payload.r) {
      case ROLES.USER:
        entity = await this.userService.getById(payload.id);
        break;
      case ROLES.FACILITY:
        entity = this.facilitiesService.getById(payload.id);
        break;
      default:
        throw new UnauthorizedException();
    }

    entity.role = payload.r;
    return entity;
  }
}
