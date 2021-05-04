import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import Facility from './entities/facility.entity';
import { UtilsService } from '../shared/services/utils.service';
import { RegistrationKeysService } from 'src/registration-keys/registration-keys.service';
import { CreateFacility } from './createFacility.interface';
import UpdateFacilityDto from './dto/updateFacility.dto';

@Injectable()
export class FacilitiesService {
  constructor(
    @InjectRepository(Facility)
    private readonly facilitiesRepository: Repository<Facility>,
    private readonly registrationKeysService: RegistrationKeysService,
    private readonly utilsService: UtilsService,
  ) {}

  async getById(id: string): Promise<Facility> {
    const facility = await this.facilitiesRepository.findOne(
      { id },
      { relations: ['user', 'registrationKey'] },
    );
    if (facility) {
      return facility;
    }
    throw new HttpException(
      'Facility with this id does not exist',
      HttpStatus.NOT_FOUND,
    );
  }

  public async create(facilityData: CreateFacility): Promise<Facility> {
    const registrationKey = await this.registrationKeysService.findByKey(
      facilityData.registrationKey,
    );

    if (!registrationKey) {
      throw new NotFoundException('Registration key not found!');
    }

    const newFacility: Facility = await this.facilitiesRepository.create({
      ...facilityData,
      registrationKey,
    });

    const facility = await this.facilitiesRepository.save(newFacility);
    await this.registrationKeysService.useKey(registrationKey);

    return facility;
  }

  public async update(
    id: string,
    data: UpdateFacilityDto,
  ): Promise<UpdateResult> {
    return this.facilitiesRepository.update(id, data);
  }

  public async getByRefreshToken(refreshToken: string): Promise<Facility> {
    const facility = await this.facilitiesRepository.findOne({ refreshToken });
    if (facility) {
      return facility;
    }
    throw new HttpException('Wrong token.', HttpStatus.NOT_FOUND);
  }

  public async renewRefreshToken(facility: Facility): Promise<Facility> {
    facility.refreshToken = this.utilsService.generateUUIDv4();
    return this.facilitiesRepository.save(facility);
  }

  public async getByRegistrationKey(
    registrationKey: string,
  ): Promise<Facility> {
    return await this.facilitiesRepository.findOne({
      join: {
        alias: 'facilities',
        leftJoin: { registrationKey: 'facilities.registrationKey' },
      },
      where: (qb) => {
        qb.where('registrationKey.key = :regKey', { regKey: registrationKey });
      },
    });
  }

  public async getByUserId(id: string) {
    return this.facilitiesRepository.find({
      join: {
        alias: 'facilities',
        leftJoin: { user: 'facilities.user' },
      },
      where: (qb) => {
        qb.where('user.id = :id', { id });
      },
    });
  }

  public async deleteFacility(facility: Facility): Promise<void> {
    await this.facilitiesRepository.delete(facility.id);
    await this.registrationKeysService.unUseKey(facility.registrationKey.id);
  }
}
