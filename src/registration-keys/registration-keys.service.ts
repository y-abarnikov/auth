import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import RegistrationKey from './entities/registrationKey.entity';

@Injectable()
export class RegistrationKeysService {
  constructor(
    @InjectRepository(RegistrationKey)
    private readonly registrationKeyRepository: Repository<RegistrationKey>
  ) {}

  public async findByKey(key: string, used: boolean = false): Promise<RegistrationKey> {
    const registrationKey: RegistrationKey = await this.registrationKeyRepository.findOne({ key, used });
    if (registrationKey) {
      return registrationKey;
    }

    throw new HttpException('Registration key is invalid', HttpStatus.BAD_REQUEST);
  }

  public async useKey(registrationKey: RegistrationKey): Promise<void> {
    registrationKey.used = true;
    await this.registrationKeyRepository.save(registrationKey);
  }
}
