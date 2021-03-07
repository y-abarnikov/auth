import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import Facility from "./entities/facility.entity";
import CreateFacilityDto from "./dto/createFacility.dto";
import { UtilsService } from "../shared/services/utils.service";

@Injectable()
export class FacilitiesService {
  constructor(
    @InjectRepository(Facility)
    private readonly facilitiesRepository: Repository<Facility>,
    private readonly utilsService: UtilsService,
  ) {}

  async getById(id: string): Promise<Facility> {
    const facility = await this.facilitiesRepository.findOne({ id });
    if (facility) {
      return facility;
    }
    throw new HttpException('Facility with this id does not exist', HttpStatus.NOT_FOUND);
  }

  public async create(facilityData: CreateFacilityDto): Promise<Facility> {
    const newFacility: Facility = await this.facilitiesRepository.create(facilityData);
    return this.facilitiesRepository.save(newFacility);
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
}
