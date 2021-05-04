import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
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
import { UpdateResult } from 'typeorm';
import UpdateFacilityDto from './dto/updateFacility.dto';

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

  @Patch(':id')
  @Roles(ROLES.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UsePipes(ValidationPipe)
  @UseInterceptors(ClassSerializerInterceptor)
  async updateFacility(
    @Req() request: RequestWithUser,
    @Param('id') id: string,
    @Body() updateFacilityData: UpdateFacilityDto,
  ): Promise<UpdateResult> {
    const { user } = request;
    await this.usersService.getById(user.id);
    return this.facilitiesService.update(id, updateFacilityData);
  }

  @Get(':id')
  @Roles(ROLES.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UsePipes(ValidationPipe)
  @UseInterceptors(ClassSerializerInterceptor)
  async getById(
    @Req() request: RequestWithUser,
    @Param('id') id: string,
  ): Promise<Facility> {
    const { user } = request;
    await this.usersService.getById(user.id);
    const facility: Facility = await this.facilitiesService.getById(id);
    if (facility.user.id !== user.id) {
      throw new ForbiddenException('Access denied!');
    }

    return facility;
  }

  @Get()
  @Roles(ROLES.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UsePipes(ValidationPipe)
  @UseInterceptors(ClassSerializerInterceptor)
  async getAllByOwner(@Req() request: RequestWithUser): Promise<Facility[]> {
    const { user } = request;
    await this.usersService.getById(user.id);
    return this.facilitiesService.getByUserId(user.id);
  }

  @Delete(':id')
  @Roles(ROLES.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UsePipes(ValidationPipe)
  @UseInterceptors(ClassSerializerInterceptor)
  async deleteById(
    @Req() request: RequestWithUser,
    @Param('id') id: string,
  ): Promise<void> {
    const { user } = request;
    await this.usersService.getById(user.id);
    const facility: Facility = await this.facilitiesService.getById(id);
    if (facility.user.id !== user.id) {
      throw new ForbiddenException('Access denied!');
    }

    await this.facilitiesService.deleteFacility(facility);
  }
}
