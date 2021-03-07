import { Module } from '@nestjs/common';
import { FacilitiesService } from './facilities.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import Facility from './entities/facility.entity';
import { SharedModule } from "../shared/shared.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Facility]),
    SharedModule,
  ],
  providers: [FacilitiesService],
  exports: [FacilitiesService],
})
export class FacilitiesModule {}
