import { Module } from '@nestjs/common';
import { TypeOrmModule } from "@nestjs/typeorm";
import RegistrationKey from "./entities/registrationKey.entity";
import { RegistrationKeysService } from './registration-keys.service';

@Module({
  imports: [TypeOrmModule.forFeature([RegistrationKey])],
  providers: [RegistrationKeysService],
  exports: [RegistrationKeysService],
})
export class RegistrationKeysModule {}
