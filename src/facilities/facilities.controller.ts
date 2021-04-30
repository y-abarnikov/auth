import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import RequestWithUser from '../common/interfaces/requestWithUser.interface';
import { ROLES } from '../common/constants/roles.constants';
import FacilityRegisterDto from '../facilities/dto/facilityRegister.dto';
import { Roles } from '../common/decorators/role.decorator';
import { RolesGuard } from '../common/guards/role.guard';
import Facility from '../facilities/entities/facility.entity';
import JwtAuthGuard from '../common/guards/jwtAuth.guard';
import { FacilitiesService } from './facilities.service';
import { UsersService } from '../users/users.service';
import { PostgresErrorCode } from 'src/common/constants/postgres.constants';

@Controller('facilities')
export class FacilitiesController {
  constructor(
    private readonly facilitiesService: FacilitiesService,
    private readonly usersService: UsersService,
  ) {}

  @Get('ping')
  public ping() {
    return 'PONG';
  }

  @Post()
  @Roles(ROLES.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UsePipes(ValidationPipe)
  @UseInterceptors(ClassSerializerInterceptor)
  async registerFacility(
    @Req() request: RequestWithUser,
    @Body() registrationData: FacilityRegisterDto,
  ): Promise<Facility> {
    const { user } = request;
    const userData = await this.usersService.getById(user.id);
    let facility;
    try {
      facility = await this.facilitiesService.create({
        ...registrationData,
        user: userData,
      });
    } catch (error) {
      if (error?.code === PostgresErrorCode.UniqueViolation) {
        throw new HttpException(
          'Facility with that serial number already exists',
          HttpStatus.BAD_REQUEST,
        );
      }

      throw error;
    }

    return facility;
  }
}
