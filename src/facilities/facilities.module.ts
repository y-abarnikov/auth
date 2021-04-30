import { Module } from '@nestjs/common';
import { FacilitiesService } from './facilities.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import Facility from './entities/facility.entity';
import { SharedModule } from '../shared/shared.module';
import { RegistrationKeysModule } from 'src/registration-keys/registration-keys.module';
import { FacilitiesController } from './facilities.controller';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Facility]),
    RegistrationKeysModule,
    UsersModule,
    SharedModule,
  ],
  controllers: [FacilitiesController],
  providers: [FacilitiesService],
  exports: [FacilitiesService],
})
export class FacilitiesModule {}
